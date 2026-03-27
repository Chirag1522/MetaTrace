import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

console.log("✅ Loaded MONGO_URI:", process.env.NEXT_PUBLIC_MONGO_URI || "❌ Not Found!");

const uri = process.env.NEXT_PUBLIC_MONGO_URI;
if (!uri) {
  throw new Error("❌ NEXT_PUBLIC_MONGO_URI is missing! Ensure it is set in `.env.local`.");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();


export default clientPromise;
