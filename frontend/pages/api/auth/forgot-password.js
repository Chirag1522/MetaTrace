import connectDB from "../db";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "@/lib/emailService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // ✅ Connect to MongoDB
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // ✅ Find user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: "If an account exists with this email, a reset link has been sent." 
      });
    }

    // ✅ Ensure JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing!");
      return res.status(500).json({ message: "Server error: JWT_SECRET missing" });
    }

    // ✅ Generate Reset Token (1-hour expiry)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Build reset link with fallback logic
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    // Fallback logic for resetting development/production environments
    if (!appUrl) {
      // Try to infer from request headers
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = req.headers.host || 'localhost:3000';
      appUrl = `${protocol}://${host}`;
      console.warn(`⚠️ NEXT_PUBLIC_APP_URL not set. Using fallback: ${appUrl}`);
    }
    
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
    console.log(`📧 Building reset link: ${appUrl}/reset-password?token=...`);

    // ✅ Send reset email
    const emailSent = await sendPasswordResetEmail(email, resetLink);
    
    if (!emailSent) {
      console.warn(`⚠️ Email sending failed, but reset link was generated correctly: ${resetLink}`);
    }

    if (!emailSent) {
      console.warn(`⚠️ Failed to send reset email to ${email}, but token was generated`);
      // Return success anyway to not reveal email existence issues
    }

    console.log(`✅ Password reset requested for: ${email}`);
    if (emailSent) {
      console.log(`✅ Reset email sent successfully`);
    }

    return res.status(200).json({ 
      message: "If an account exists with this email, a reset link has been sent."
    });

  } catch (error) {
    console.error("❌ Error in forgot-password:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}
