# ✨ MetaTrace - Secure File Authentication & Metadata Analysis

> A comprehensive platform for file authenticity verification, metadata extraction, and blockchain-based proof of ownership with optional wallet integration.

![Build Status](https://img.shields.io/badge/status-active-brightgreen)
![Node](https://img.shields.io/badge/Node-16+-blue)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 New Features (Latest Update)

### 🔐 Optional Wallet Connection
- Connect MetaMask wallet **after login** (user's choice)
- Store wallet address with file metadata
- Manage wallet from profile settings
- Works with blockchain for permanent records
- No wallet needed to use platform

### 📱 Fully Responsive Design
- Mobile-first approach
- Tablet & desktop optimized
- Responsive navigation with hamburger menu
- Touch-friendly interfaces
- Works on all screen sizes

### 🔑 Environment Configuration
- All sensitive data in `.env` files
- Easy deployment across environments
- Template files provided
- Secure credential management
- Production-ready setup

## 🎯 Key Features

### File Authentication
- ✅ Metadata extraction from multiple file types
- ✅ Tamper detection using SuSy algorithm
- ✅ IPFS integration for immutable storage
- ✅ Blockchain verification
- ✅ AI-powered anomaly detection

### Security
- ✅ JWT-based authentication
- ✅ Token expiry (7 days)
- ✅ Password encryption with bcrypt
- ✅ MongoDB secure storage
- ✅ Environment variable protection

### User Experience
- ✅ Responsive UI with Tailwind CSS
- ✅ Real-time file upload
- ✅ Metadata visualization
- ✅ File deletion capability
- ✅ Recent uploads dashboard

### Blockchain Integration
- ✅ Moonbeam testnet support
- ✅ Smart contract metadata storage
- ✅ Public verification capability
- ✅ Transaction tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB Atlas account
- MetaMask browser extension

### Installation

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

#### Backend
```bash
cd app
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Create .env from .env.example
uvicorn main:app --reload
```

Access at: http://localhost:3000

## 📋 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_MONGO_URI=mongodb+srv://...
NEXT_PUBLIC_RPC_URL=https://rpc.api.moonbase.moonbeam.network
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_API_KEY=...
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
JWT_SECRET=your_secret_key
NEXT_PUBLIC_ENABLE_WALLET=true
NEXT_PUBLIC_WALLET_OPTIONAL=true
```

### Backend (.env)
```env
MONGO_URI=mongodb+srv://...
RPC_URL=https://rpc.api.moonbase.moonbeam.network
PRIVATE_KEY=...
GROQ_API_KEY=...
PINATA_API_KEY=...
```

See `.env.example` for complete templates.

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[WALLET_FEATURE.md](WALLET_FEATURE.md)** - Wallet integration details
- **[QUICKSTART.md](QUICKSTART.md)** - Developer quick reference

## 🏗️ Project Structure

```
MetaTrace/
├── frontend/
│   ├── pages/
│   │   ├── login.js          (Responsive auth)
│   │   ├── signup.js         (Responsive registration)
│   │   ├── upload.js         (File upload with wallet modal)
│   │   ├── profile.js        (User profile & wallet management)
│   │   └── api/              (Backend API routes)
│   ├── components/
│   │   ├── Navbar.js         (Responsive, auth-aware)
│   │   ├── ProfileCard.js    (Wallet management)
│   │   ├── WalletConnectModal.js (NEW - Wallet connection)
│   │   └── ...
│   ├── lib/
│   │   └── mongodb.js        (DB connection)
│   └── .env.local            (Environment variables)
│
├── app/
│   ├── main.py               (FastAPI server)
│   ├── tamper_audit.py       (Detection algorithm)
│   └── .env                  (Backend config)
│
├── DEPLOYMENT.md             (Deployment guide)
├── WALLET_FEATURE.md         (Wallet documentation)
└── QUICKSTART.md             (Quick reference)
```

## 🔄 User Flow

### Authentication
1. User signs up/logs in
2. JWT token generated (7-day expiry)
3. Token stored in localStorage

### Wallet Connection
1. After login, wallet modal appears (optional)
2. User chooses: Connect or Skip
3. If connected, wallet address stored in localStorage
4. Can be managed from profile page

### File Upload
1. Select file from computer
2. Drag & drop supported
3. File sent to backend for analysis
4. Metadata extracted and analyzed
5. Results displayed with recommendations
6. Wallet address included if connected

### Blockchain Storage
1. Metadata stored on-chain (Moonbeam)
2. Public verification available
3. Immutable proof of authenticity
4. Smart contract interaction

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13+
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Blockchain**: Web3.js, Ethers.js
- **Auth**: JWT tokens
- **Storage**: MongoDB, IPFS (Pinata)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Database**: MongoDB
- **Blockchain**: Web3.py
- **AI**: Groq API, Google Generative AI

### Infrastructure
- **Hosting**: Vercel (frontend), AWS/DigitalOcean (backend)
- **Database**: MongoDB Atlas
- **IPFS**: Pinata
- **Blockchain**: Moonbeam testnet

## 🔒 Security Features

- **Password Security**: Bcrypt encryption
- **Token Security**: JWT with expiry
- **Data Protection**: Environment variables
- **Network Security**: CORS protection
- **Private Keys**: Never exposed to frontend
- **HTTPS**: Required in production

## 📱 Responsive Design

- **Mobile** (< 640px): Single column, hamburger menu
- **Tablet** (640-1024px): Adaptive layout
- **Desktop** (1024px+): Full features

All pages tested and optimized for all screen sizes.

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel
```

### Backend (DigitalOcean/AWS)
```bash
gunicorn -w 4 main:app
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Profile data
- `PUT /api/auth/update-profile` - Update profile

### Files
- `POST /api/upload` - Upload file
- `GET /api/files` - List files
- `DELETE /api/deleteFile` - Delete file

### Blockchain
- `POST /recommend` - Get AI analysis
- Backend: `/upload/` - Metadata extraction

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Build check
npm run build

# Backend tests
pytest
```

## 📊 Performance

- **Page Load**: < 2 seconds
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic
- **Bundle Size**: Optimized

## 🐛 Troubleshooting

### Wallet Issues
- MetaMask not connecting? Install extension
- Wrong network? Switch to Moonbeam testnet
- See browser console for detailed errors

### Database Issues
- MongoDB connection failed? Check IP whitelist
- Verify connection string in .env
- Use MongoDB Compass to test

### API Issues
- Backend not responding? Check port 8000
- CORS errors? Update CORS_ORIGINS
- See server logs for details

See [QUICKSTART.md](QUICKSTART.md) for more troubleshooting.

## 🤝 Contributing

1. Clone the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Moonbeam Network** - Blockchain integration
- **Pinata** - IPFS hosting
- **Groq** - AI recommendations
- **MongoDB** - Database
- **Tailwind CSS** - Styling
- **Next.js** - Frontend framework

## 📞 Support

For issues and questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) & [QUICKSTART.md](QUICKSTART.md)
2. Review error logs
3. Check environment variables
4. Test components individually

## 🗺️ Roadmap

- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Hardware wallet integration
- [ ] NFT minting for verified files
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] API v2 with webhooks
- [ ] Improved AI recommendations
- [ ] File encryption option

---

**Last Updated**: March 28, 2026  
**Version**: 2.0.0 (Wallet & Responsive Update)  
**Status**: Production Ready ✅

Made with ❤️ by Chirag
