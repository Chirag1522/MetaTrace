import connectDB from "../db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    // Verify ID token with Google's tokeninfo endpoint
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) {
      const txt = await googleRes.text();
      console.error('Google tokeninfo failed:', txt);
      return res.status(401).json({ message: 'Invalid Google ID token' });
    }
    const info = await googleRes.json();

    // Basic checks
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID not set');
      return res.status(500).json({ message: 'Server misconfigured' });
    }

    if (info.aud !== clientId) {
      console.error('Google ID token audience mismatch', info.aud, clientId);
      return res.status(401).json({ message: 'Invalid token audience' });
    }

    // info contains email, name, sub (Google user id)
    const email = info.email;
    const name = info.name || '';
    const googleId = info.sub;

    // connect to DB
    const db = await connectDB();
    const users = db.collection('users');

    let user = await users.findOne({ email });
    if (!user) {
      // create user
      const insert = await users.insertOne({ name, email, googleId, provider: 'google' });
      user = { _id: insert.insertedId, name, email };
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing');
      return res.status(500).json({ message: 'Server error' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.decode(token);
    return res.status(200).json({ token, expiry: decoded.exp * 1000 });
  } catch (error) {
    console.error('Google auth error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
