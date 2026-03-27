# MetaTrace Deployment Guide

## Overview
This guide covers the deployment of MetaTrace with wallet connection feature and environment variable configuration.

## Prerequisites
- Node.js 16+ 
- Python 3.8+
- MongoDB Atlas account
- Pinata API account (for IPFS)
- MetaMask (for wallet testing)
- Groq API key (for AI recommendations)

## Features Implemented
✅ **Wallet Connection** - Optional MetaMask integration after login
✅ **Environment Variables** - All sensitive data moved to .env files
✅ **Responsive Design** - Mobile-friendly UI with Tailwind CSS
✅ **Secure Authentication** - JWT-based auth with token expiry

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required Variables:**
- `NEXT_PUBLIC_MONGO_URI` - MongoDB connection string
- `NEXT_PUBLIC_RPC_URL` - Blockchain RPC endpoint
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Smart contract address
- `NEXT_PUBLIC_PINATA_API_KEY` - Pinata IPFS API key
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_BACKEND_API_URL` - FastAPI backend URL

### 3. Development Server
```bash
npm run dev
```
Access at: http://localhost:3000

### 4. Production Build
```bash
npm run build
npm start
```

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Enable these Environment Variables in Vercel Dashboard:
- All `NEXT_PUBLIC_*` variables
- `JWT_SECRET`
- `CLOUDINARY_API_SECRET`

## Backend Setup

### 1. Create Virtual Environment
```bash
cd app
python -m venv venv

# Activate
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add:
- `MONGO_URI` - MongoDB connection string
- `RPC_URL` - Blockchain RPC endpoint
- `PRIVATE_KEY` - Deployment account private key
- `GROQ_API_KEY` - Groq API for AI features
- `PINATA_API_KEY` - Pinata credentials

### 4. Run Backend
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Wallet Integration

### How It Works
1. **After Login**: User sees optional wallet connection modal
2. **Optional Connection**: User can skip or connect MetaMask
3. **Profile Management**: Wallet can be connected/disconnected from profile
4. **File Upload**: Connected wallet address is included in metadata

### Enable/Disable Wallet
Set in `.env.local`:
```
NEXT_PUBLIC_ENABLE_WALLET=true
NEXT_PUBLIC_WALLET_OPTIONAL=true
```

## Deployment Checklist

### Before Deploying
- [ ] Update MongoDB credentials in `.env`
- [ ] Add RPC URL for production network (if not testnet)
- [ ] Configure CORS_ORIGINS in backend
- [ ] Set up HTTPS certificates
- [ ] Add production JWT secret (strong and unique)
- [ ] Update API endpoints for production
- [ ] Test wallet connection in production

### Environment Variables Needed
**Frontend (.env.local):**
```
NEXT_PUBLIC_MONGO_URI=
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_API_KEY=
NEXT_PUBLIC_BACKEND_API_URL=
JWT_SECRET=
NEXT_PUBLIC_ENABLE_WALLET=true
NEXT_PUBLIC_WALLET_OPTIONAL=true
```

**Backend (.env):**
```
RPC_URL=
PRIVATE_KEY=
MONGO_URI=
PINATA_API_KEY=
GROQ_API_KEY=
CORS_ORIGINS=https://yourdomain.com
```

## Key Features

### Wallet Connection
- Location: Navbar (desktop) & after upload page (mobile)
- Optional: Users can choose to use default storage
- Managed in: Profile > Wallet Settings

### Responsive Design
- Mobile breakpoints: sm (640px), md (768px), lg (1024px)
- Optimized for all screen sizes
- Touch-friendly buttons and forms

### Environment Configuration
- All secrets in `.env` files
- `.env.example` for templates
- Secure credential management
- Easy deployment across environments

## Troubleshooting

### Wallet Not Connecting
- Ensure MetaMask is installed
- Check if wallet is on correct network
- Look for browser console errors

### Backend API Errors
- Verify `NEXT_PUBLIC_BACKEND_API_URL` is correct
- Check backend is running on specified port
- Verify CORS configuration

### Environment Variable Issues
- Ensure `.env.local` exists in frontend folder
- Verify `.env` exists in app folder
- Restart dev server after changing env vars
- For Next.js, `NEXT_PUBLIC_` prefix is required for browser-accessible vars

### MongoDB Connection
- Verify connection string in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure database credentials are correct

## Support

For deployment issues:
1. Check console logs for specific errors
2. Verify all environment variables are set
3. Review the `.env.example` files for required variables
4. Test each component separately

## Security Notes
- Never commit `.env` or `.env.local` to git
- Use strong JWT secrets
- Rotate private keys regularly
- Enable rate limiting in production
- Use HTTPS only in production
- Keep API keys secure and rotate them periodically
