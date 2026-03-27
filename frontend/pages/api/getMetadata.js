import { MongoClient } from "mongodb";
import { ethers } from "ethers";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI;
const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "testdb";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getMetadata",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db(DB_NAME);

      // Find user files in MongoDB
      const files = await db.collection("uploads").find({ email }).toArray();
      await client.close();

      if (!files.length) {
        return res.status(404).json({ message: "No files found for this user" });
      }

      // Fetch metadata from blockchain
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const blockchainMetadata = await contract.getMetadata(files[0].blockchainTokenId);

      res.status(200).json({ files, blockchainMetadata });

    } catch (error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
