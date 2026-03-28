# 🚀 MetaTrace Deployment Guide

## Overview
MetaTrace stack:
- **Frontend**: Next.js (Node.js)
- **Backend**: Python FastAPI
- **Database**: MongoDB Atlas
- **Wallet**: RainbowKit/wagmi + Moonbase Alpha testnet
- **Email**: Gmail SMTP via Nodemailer
- **Storage**: Cloudinary + IPFS (Pinata)

---

## **OPTION 1: Deploy to Vercel (Easiest for Frontend)**

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MetaTrace.git
git push -u origin main
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Connect your GitHub account

### Step 3: Deploy Frontend
1. Click "Add New" → "Project"
2. Select your MetaTrace repository
3. Choose "Next.js"
4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 4: Add Environment Variables in Vercel
In Vercel Dashboard → Settings → Environment Variables, add:

```
# MongoDB
NEXT_PUBLIC_MONGO_URI=mongodb+srv://chirag:chirag123@metatrace.zfxfj.mongodb.net/?retryWrites=true&w=majority&appName=MetaTrace
NEXT_PUBLIC_DB_NAME=testdb

# JWT
JWT_SECRET=448060e76d7d32558d2088cf372f3c1577d9954966afab4863d9ebf3e8e23480

# Email (Gmail)
GMAIL_EMAIL=metatrace04@gmail.com
GMAIL_APP_PASSWORD=vhjnnqujrerzcbxk
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_DOMAIN.vercel.app

# API
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_API_URL=https://YOUR_VERCEL_DOMAIN.vercel.app/api

# Blockchain
NEXT_PUBLIC_RPC_URL=https://rpc.api.moonbase.moonbeam.network
NEXT_PUBLIC_CONTRACT_ADDRESS=0xb51f74aa44AccD2d6fD0E8c0Bc78Af2c5819F197
NEXT_PUBLIC_BLOCKCHAIN_PRIVATE_KEY=8d9043fe7be7c70134bc3849a314a545f4da8b0dc207a58b94ff6d20d3220652

# IPFS (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=25b25147c472c196555d
NEXT_PUBLIC_PINATA_SECRET_API_KEY=4162fa758e5b1cc705b97cc91ab58bb88b956db07d8044c8a75840fbf57dae24

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=chirag84
NEXT_PUBLIC_CLOUDINARY_API_KEY=479271181843866
CLOUDINARY_API_SECRET=0AKvBBfVnjjCRIU83Dr4_cqevvk

# Wallet
NEXT_PUBLIC_ENABLE_WALLET=true
NEXT_PUBLIC_WALLET_OPTIONAL=true
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
```

**Get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com/
2. Create new project
3. Copy Project ID
4. Add to Vercel

### Step 5: Click "Deploy"
Vercel will automatically:
- Build your Next.js app
- Deploy to CDN
- Give you a live URL like: `https://metatrace.vercel.app`

✅ **Frontend is now live!**

---

## **OPTION 2: Deploy Backend to Render (Easy for Python)**

### Step 1: Prepare Backend Code
Your `app/` folder contains FastAPI. Make sure it has:
- `requirements.txt` (with all dependencies)
- `main.py` (entry point)

### Step 2: Create `Procfile` in root
```
web: cd app && uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 3: Push to GitHub
(Same as frontend)

### Step 4: Deploy on Render
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Name**: `metatrace-backend`
   - **Root Directory**: `app`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free (or Paid)

### Step 5: Add Environment Variables
In Render Dashboard → Environment:

```
MONGODB_URI=mongodb+srv://chirag:chirag123@metatrace.zfxfj.mongodb.net/?retryWrites=true&w=majority&appName=MetaTrace
DB_NAME=testdb
JWT_SECRET=448060e76d7d32558d2088cf372f3c1577d9954966afab4863d9ebf3e8e23480
```

### Step 6: Deploy
Render automatically deploys when you push to GitHub.

✅ **Backend is now live!** (e.g., `https://metatrace-backend.onrender.com`)

---

## **OPTION 3: Deploy Everything to AWS (Complete Setup)**

### Frontend on AWS Amplify
1. Go to AWS Amplify Console
2. Connect GitHub repo
3. Select `frontend` folder
4. Add env vars (same as Vercel)
5. Deploy

### Backend on AWS EC2
1. Create EC2 instance (Ubuntu 24.04)
2. SSH into instance
3. Install Python & dependencies:
   ```bash
   sudo apt update && sudo apt install python3-pip
   cd /home/ubuntu
   git clone YOUR_REPO
   cd MetaTrace/app
   pip install -r requirements.txt
   ```
4. Run with Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```
5. Use Nginx as reverse proxy
6. Get domain name (Route 53)

---

## **Step-by-Step Summary (Fastest)**

### **For Quick Deploy (5 minutes):**

**1. Frontend on Vercel:**
- Push to GitHub → Connect to Vercel → Add env vars → Deploy ✅

**2. Backend on Render:**
- Same repo → Select backend folder → Add env vars → Deploy ✅

**3. Update URLs:**
- In Vercel env vars: Set `NEXT_PUBLIC_BACKEND_API_URL` = your Render URL
- In Render env vars: Make sure MongoDB URI is set

---

## **Critical Environment Variables Checklist**

Before deploying, make sure you have:

### **Frontend (Vercel)**
- ✅ `NEXT_PUBLIC_MONGO_URI` - MongoDB connection
- ✅ `JWT_SECRET` - Same as backend
- ✅ `GMAIL_EMAIL` & `GMAIL_APP_PASSWORD` - Email sending
- ✅ `NEXT_PUBLIC_APP_URL` - Your Vercel domain
- ✅ `NEXT_PUBLIC_BACKEND_API_URL` - Backend domain
- ✅ `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - From walletconnect.com

### **Backend (Render)**
- ✅ `MONGODB_URI` - Same as frontend
- ✅ `JWT_SECRET` - Same as frontend

### **Database (MongoDB)**
- ✅ Connect Vercel & Render IPs to MongoDB Atlas
  - Go to MongoDB Atlas → Network Access → IP Whitelist
  - Add `0.0.0.0/0` (allow all) for testing
  - Or add specific IPs: Vercel IPs + Render IPs

---

## **Testing After Deployment**

### **1. Test Frontend**
```
https://YOUR_VERCEL_DOMAIN.vercel.app
```
- Login/Signup page loads? ✅
- Dark mode works? ✅
- Images load? ✅

### **2. Test Forgot Password Email**
```
1. Go to /forgot-password
2. Enter email
3. Check Gmail inbox → Should receive email
```

### **3. Test API Calls**
```
POST https://YOUR_VERCEL_DOMAIN.vercel.app/api/auth/login
Body: { email: "test@example.com", password: "testpass" }
```

---

## **Domain Setup (Optional)**

### **Custom Domain on Vercel**
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel Settings → Domains
3. Add domain
4. Update DNS to Vercel nameservers

### **Custom Domain on Render**
1. Same process
2. Add CNAME record pointing to Render URL

---

## **Production Checklist**

- [ ] All env vars are set on hosting platforms
- [ ] MongoDB allows connections from your IPs
- [ ] Frontend can call backend API
- [ ] Email sending works
- [ ] Wallet connection works
- [ ] Dark mode persists
- [ ] Forgot password email sends
- [ ] Login/Signup successful
- [ ] Database queries working
- [ ] No console errors

---

## **Common Issues & Fixes**

### **❌ "Cannot find module" error**
**Fix**: 
```bash
npm install  # Install all dependencies
```

### **❌ "MongoDB connection timeout"**
**Fix**: 
- Check MongoDB Atlas IP whitelist
- Add your hosting IP or `0.0.0.0/0`

### **❌ "Email not sending"**
**Fix**: 
- Verify Gmail app password is correct
- Check 2-Step Verification is ON
- Check spam folder

### **❌ "CORS errors"**
**Fix**: 
- Add backend domain to allowed origins
- Check API headers

### **❌ "Wallet not connecting"**
**Fix**: 
- Add WalletConnect Project ID
- Check testnet is set to Moonbase Alpha

---

## **Cost Estimate**

| Service | Cost | Notes |
|---------|------|-------|
| **Vercel** | Free | $20/mo with custom domain |
| **Render** | Free | Spins down after 15 min inactivity |
| **MongoDB Atlas** | Free | 512MB - upgrade for production |
| **Gmail** | Free | Unlimited sends |
| **Cloudinary** | Free | 25GB storage |
| **Total** | **Free** | Can scale as needed |

---

## **Questions?**

**Need help with specific platform?**
- A) Vercel
- B) Render  
- C) AWS
- D) Heroku

Let me know which one you prefer! 🚀
