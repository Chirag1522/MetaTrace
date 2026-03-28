import connectDB from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    // ✅ Ensure JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing!");
      return res.status(500).json({ message: "Server error: JWT_SECRET missing" });
    }

    // ✅ Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`✅ Token verified for user: ${decoded.email}`);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.warn(`⚠️ Token expired for user: ${error.message}`);
        return res.status(401).json({ message: "Reset link has expired. Please request a new one." });
      }
      if (error.name === 'JsonWebTokenError') {
        console.warn(`⚠️ Invalid token: ${error.message}`);
        return res.status(401).json({ message: "Invalid reset link." });
      }
      console.error(`❌ Token verification error: ${error.message}`);
      return res.status(401).json({ message: "Invalid reset link." });
    }

    // ✅ Check if token is a password reset token
    if (decoded.type !== 'password-reset') {
      return res.status(401).json({ message: "Invalid reset link." });
    }

    // ✅ Connect to MongoDB
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // ✅ Find user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update user password
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to update password. Please try again." });
    }

    console.log(`✅ Password reset successful for user: ${user.email}`);

    return res.status(200).json({ 
      message: "Password has been reset successfully. You can now log in with your new password." 
    });

  } catch (error) {
    console.error("❌ Error in reset-password:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}
