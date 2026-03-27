import { MongoClient } from "mongodb";

const connectDB = async () => {
  const mongoUri = process.env.NEXT_PUBLIC_MONGO_URI || process.env.MONGO_URI;
  
  if (!mongoUri) {
    throw new Error("❌ MONGO_URI is not defined. Check your .env.local file. Expected: NEXT_PUBLIC_MONGO_URI");
  }

  const client = new MongoClient(mongoUri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  return client.db(process.env.NEXT_PUBLIC_DB_NAME || "testdb");
};

export default connectDB;