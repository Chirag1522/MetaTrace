import formidable from "formidable";
import { MongoClient } from "mongodb";
import fs from "fs"; 
import fetch from "node-fetch";
import FormData from "form-data";
import Web3 from "web3";
import axios from "axios";
import { metadata } from "../_app";

export const config = { api: { bodyParser: false } };

// 🔹 Load from Environment Variables
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI || "mongodb+srv://chirag:chirag123@metatrace.zfxfj.mongodb.net/";
const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "testdb";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xb51f74aa44AccD2d6fD0E8c0Bc78Af2c5819F197";
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.api.moonbase.moonbeam.network"; 
const PRIVATE_KEY = process.env.NEXT_PUBLIC_BLOCKCHAIN_PRIVATE_KEY || "8d9043fe7be7c70134bc3849a314a545f4da8b0dc207a58b94ff6d20d3220652";
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "25b25147c472c196555d";
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || "4162fa758e5b1cc705b97cc91ab58bb88b956db07d8044c8a75840fbf57dae24";
const BACKEND_API_URL = "https://metatrace-backend.onrender.com";

// 🔹 Web3.js Blockchain Connection
let web3, account, contract;

try {
  console.log("🔹 Connecting to blockchain...");
  web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
  account = web3.eth.accounts.privateKeyToAccount(`0x${PRIVATE_KEY}`);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  const contractAbi = [
    {
      "inputs": [
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
        { "internalType": "string", "name": "jsonData", "type": "string" }
      ],
      "name": "storeMetadata",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
  console.log(`✅ Connected to blockchain as ${account.address}`);
} catch (error) {
  console.error("❌ Failed to connect to blockchain:", error);
}

// 🔹 Function to Upload to Pinata IPFS
async function uploadToPinata(filePath, fileName) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), fileName);

  const pinataMetadata = JSON.stringify({ name: fileName });
  formData.append("pinataMetadata", pinataMetadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  try {
    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY,
      },
    });
    console.log("✅ File uploaded to Pinata IPFS:", response.data.IpfsHash);
    return response.data.IpfsHash; // Return the IpfsHash (pinataCid)
  } catch (error) {
    console.error("❌ Pinata IPFS upload failed:", error);
    throw new Error("Pinata IPFS upload failed");
  }
}

// 🔹 Function to Store Metadata on Blockchain
async function storeOnBlockchain(data) {
  try {
    console.log("📤 Sending metadata to blockchain...");

    // 👈 CHANGED: Prepare the full metadata object for storage.
    // This includes all ExifTool data and the full tamper_report.
    const dataToStore = {
      ...data.metadata, // This is the object you provided
      ipfsCid: data.pinataCid || data.ipfsCid || null, // Manually add the IPFS CID
    };

    // 👈 CHANGED: Stringify the full object, not the 'compact' one.
    const jsonString = JSON.stringify(dataToStore);

    // estimate gas if possible
    // 👈 CHANGED: Increased default gas limit. 500,000 is too low for this much data.
    let gasToUse = 3000000; // Increased sensible default
    try {
      const estimated = await contract.methods.storeMetadata(1, jsonString).estimateGas({ from: account.address });
      if (estimated && typeof estimated === 'number') gasToUse = Math.floor(estimated * 1.3);
    } catch (err) {
      // estimation may fail on some providers; continue with default
      console.warn(`Gas estimation failed (this is expected if data is large), using default: ${gasToUse}`, err && err.message);
    }

    let gasPrice;
    try {
      gasPrice = await web3.eth.getGasPrice();
    } catch (err) {
      gasPrice = await web3.utils.toWei('5', 'gwei');
    }

    const tx = await contract.methods.storeMetadata(1, jsonString).send({
      from: account.address,
      gas: gasToUse,
      gasPrice,
    });

    console.log(`✅ Blockchain transaction successful! TxHash: ${tx.transactionHash}`);
    return { txHash: tx.transactionHash, message: 'Stored full metadata on blockchain' };
  } catch (error) {
    // Log but do not throw to avoid unhandled rejections in the upload flow
    console.error('❌ Blockchain error:', error && (error.message || error));
    return { error: error && (error.message || String(error)) };
  }
}

// 🔹 API Handler
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      console.log("📩 Receiving file upload request...");
      const form = formidable({ multiples: false });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("❌ File upload failed:", err);
          return res.status(500).json({ message: "File upload failed" });
        }

  const file = files.file[0];
  const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
  const walletAddress = Array.isArray(fields.walletAddress) ? fields.walletAddress[0] : fields.walletAddress;

        if (!file || !email) {
          console.error("❌ Missing file or email");
          return res.status(400).json({ message: "Missing file or email" });
        }

        console.log("📤 Uploading file to Pinata IPFS...");
        const ipfsHash = await uploadToPinata(file.filepath, file.originalFilename);
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`; // Pinata URL

        // 🔹 Send File to FastAPI Backend for Metadata Extraction
        console.log("📤 Sending file to FastAPI for metadata extraction...");
        const fastApiFormData = new FormData();
        fastApiFormData.append("file", fs.createReadStream(file.filepath), file.originalFilename);
        fastApiFormData.append("email", email);

        const fastApiResponse = await fetch(`${BACKEND_API_URL}/upload/`, {
          method: "POST",
          body: fastApiFormData,
          headers: fastApiFormData.getHeaders(),
        });

        if (!fastApiResponse.ok) {
          throw new Error(`FastAPI error: ${fastApiResponse.statusText}`);
        }

  const fastApiData = await fastApiResponse.json();
  console.log("✅ Metadata received from FastAPI:", fastApiData);
  const { message, ...metadataWithoutMessage } = fastApiData;
  // tamper report is returned inside metadata.tamper_report by FastAPI
  const tamperReport = (metadataWithoutMessage.metadata && metadataWithoutMessage.metadata.tamper_report) || null;

        // 🔹 Store in MongoDB (Including Pinata CID)
        console.log("📦 Connecting to MongoDB...");
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log("✅ Connected to MongoDB!");

        const db = client.db(DB_NAME);
        
        const fileData = {
          email,
          filename: file.originalFilename,
          ipfsUrl,
          pinataCid: ipfsHash,
          type: file.mimetype,
          size: file.size,
          uploadDate: new Date(),
          // include tamper report returned by FastAPI inside metadata
          metadata: Object.assign({}, metadataWithoutMessage.metadata || {}, { tamper_report: tamperReport, ...(walletAddress ? { walletAddress } : {}) }),
          // optional connected wallet address from client (kept at top-level too)
          ...(walletAddress ? { walletAddress } : {}),
        };
        
        await db.collection("uploads").insertOne(fileData);
        console.log("✅ File metadata stored in MongoDB!");
        await client.close();

        fs.unlinkSync(file.filepath); // Cleanup temp file
        console.log("🧹 Temporary file deleted.");

        // 🔹 Store Metadata on Blockchain
        const blockchainResponse = await storeOnBlockchain(fileData);

        return res.status(200).json({
          metadata: fileData,
          blockchain: blockchainResponse,
        });
      });
    } catch (error) {
      console.error("❌ Internal Server Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const { email } = req.query;
      if (!email) {
        console.error("❌ User email is required");
        return res.status(400).json({ message: "User email is required" });
      }

      console.log("📦 Fetching files from MongoDB...");
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log("✅ Connected to MongoDB!");

      const db = client.db(DB_NAME);
      const files = await db.collection("uploads").find({ email }).sort({ uploadDate: -1 }).toArray();
      await client.close();

      console.log("✅ Retrieved uploaded files for user:", email);
      res.status(200).json({ files });
    } catch (error) {
      console.error("❌ Failed to fetch uploaded files:", error);
      res.status(500).json({ message: "Failed to fetch uploaded files", error: error.message });
    }
  } else {
    console.error("❌ Method not allowed:", req.method);
    res.status(405).json({ message: "Method not allowed" });
  }
}
