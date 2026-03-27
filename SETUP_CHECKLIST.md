# ✅ MetaTrace Setup & Deployment Checklist

## Pre-Deployment Setup (Do This First!)

### 1. Environment Variables Configuration

#### Frontend Setup
```bash
cd frontend
cp .env.example .env.local
```

Then edit `.env.local` and add your credentials:
- [ ] NEXT_PUBLIC_MONGO_URI - MongoDB connection string
- [ ] NEXT_PUBLIC_RPC_URL - Keep default or update
- [ ] NEXT_PUBLIC_CONTRACT_ADDRESS - Smart contract address
- [ ] NEXT_PUBLIC_PINATA_API_KEY - Get from Pinata
- [ ] NEXT_PUBLIC_PINATA_SECRET_API_KEY - Get from Pinata
- [ ] NEXT_PUBLIC_BACKEND_API_URL - Backend server URL
- [ ] JWT_SECRET - Generate: openssl rand -hex 32
- [ ] NEXT_PUBLIC_ENABLE_WALLET - Set to true
- [ ] NEXT_PUBLIC_WALLET_OPTIONAL - Set to true

#### Backend Setup
```bash
cd app
cp .env.example .env
```

Edit `.env` and add:
- [ ] MONGO_URI - Same as NEXT_PUBLIC_MONGO_URI
- [ ] RPC_URL - Same as NEXT_PUBLIC_RPC_URL
- [ ] PRIVATE_KEY - Your deployment account private key
- [ ] GROQ_API_KEY - Get from Groq API
- [ ] PINATA_API_KEY - Same as frontend
- [ ] CORS_ORIGINS - http://localhost:3000 for dev

### 2. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```
- [ ] No errors
- [ ] node_modules created

#### Backend
```bash
cd app
python -m venv venv
# Activate venv
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```
- [ ] Virtual environment created
- [ ] All packages installed
- [ ] No errors

## Local Development Testing

### 3. Start Development Servers

#### Frontend Server
```bash
cd frontend
npm run dev
```
Should show: "✓ ready - started server on 0.0.0.0:3000"
- [ ] Frontend running at http://localhost:3000
- [ ] No errors in console

#### Backend Server (New Terminal)
```bash
cd app
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```
Should show: "Uvicorn running"
- [ ] Backend running at http://localhost:8000
- [ ] No errors in console

### 4. Test Core Functionality

#### User Authentication
```
Go to: http://localhost:3000/signup
- [ ] Signup form displays
- [ ] Name field works
- [ ] Email validation works
- [ ] Password strength indicator works
- [ ] Form submits successfully
```

#### Login
```
Go to: http://localhost:3000/login
- [ ] Login form displays
- [ ] Email field works
- [ ] Password field shows/hides
- [ ] Login succeeds with correct credentials
- [ ] Token stored in localStorage
```

#### Wallet Modal
```
After login, should see wallet modal:
- [ ] Modal displays
- [ ] "Connect MetaMask" button visible
- [ ] "Continue Without Wallet" button visible
- [ ] Skip button works
- [ ] Modal closes on skip
```

#### Wallet Connection
```
With MetaMask installed:
- [ ] Install MetaMask if not present
- [ ] Click "Connect MetaMask"
- [ ] MetaMask popup appears
- [ ] Approve connection
- [ ] Wallet address shows in navbar
- [ ] Can see shortened address (0x.....)
```

#### Upload Functionality
```
Go to: http://localhost:3000/upload
- [ ] Upload area displays
- [ ] Can select file
- [ ] Can drag and drop
- [ ] File uploads successfully
- [ ] Metadata displays
- [ ] Recent uploads show
```

#### Profile Page
```
Go to: http://localhost:3000/profile
- [ ] Profile information displays
- [ ] Wallet section shows
- [ ] Wallet address displays correctly
- [ ] Can see uploaded files
- [ ] Can delete files
- [ ] Can edit profile
```

### 5. Test Responsive Design

#### Mobile (< 640px)
- [ ] Open DevTools (F12)
- [ ] Toggle Device Toolbar (Ctrl+Shift+M)
- [ ] Select mobile preset
- [ ] Check Navbar hamburger menu appears
- [ ] Click menu to toggle
- [ ] Forms stack vertically
- [ ] Buttons full width
- [ ] Images hidden
- [ ] No horizontal scrolling

#### Tablet (768px - 1024px)
- [ ] Select iPad preset
- [ ] Forms have good spacing
- [ ] Images now visible
- [ ] Layout properly centered
- [ ] All text readable

#### Desktop (1024px+)
- [ ] Full width menu visible
- [ ] Two-column layouts work
- [ ] Images display large
- [ ] All features accessible

### 6. Test Environment Variables

#### Verify Frontend Variables Load
In browser console:
```javascript
// Should work (NEXT_PUBLIC_ prefix)
console.log(process.env.NEXT_PUBLIC_MONGO_URI)

// Should not work (no prefix)
console.log(process.env.JWT_SECRET)
```
- [ ] NEXT_PUBLIC variables accessible
- [ ] JWT_SECRET not accessible

#### Verify Backend Variables Load
In backend logs:
- [ ] MongoDB connected
- [ ] Blockchain connected
- [ ] No "undefined" errors
- [ ] No "missing variable" errors

## Production Deployment Checklist

### 7. Pre-Deployment Verification

#### Code Quality
```bash
cd frontend
npm run build
```
- [ ] Build succeeds
- [ ] No errors
- [ ] No warnings
- [ ] Bundle size reasonable

#### Security Audit
- [ ] No hardcoded secrets
- [ ] .env.local in .gitignore
- [ ] .env in .gitignore
- [ ] JWT secret is strong (32+ chars)
- [ ] All API keys secured

#### Testing Complete
- [ ] User registration works
- [ ] User login works
- [ ] Wallet connects (with MetaMask)
- [ ] File upload works
- [ ] File metadata displays
- [ ] Profile management works
- [ ] Mobile design works
- [ ] No console errors

### 8. Frontend Deployment (Vercel)

#### Create Vercel Project
```bash
npm install -g vercel
cd frontend
vercel
```
- [ ] Vercel account created
- [ ] Project created
- [ ] Connected to GitHub (optional)

#### Set Environment Variables in Vercel
Dashboard → Settings → Environment Variables
Add each variable:

**Public Variables** (available in browser - NEXT_PUBLIC_ prefix)
- [ ] NEXT_PUBLIC_MONGO_URI
- [ ] NEXT_PUBLIC_RPC_URL
- [ ] NEXT_PUBLIC_CONTRACT_ADDRESS
- [ ] NEXT_PUBLIC_PINATA_API_KEY
- [ ] NEXT_PUBLIC_PINATA_SECRET_API_KEY
- [ ] NEXT_PUBLIC_BACKEND_API_URL
- [ ] NEXT_PUBLIC_ENABLE_WALLET
- [ ] NEXT_PUBLIC_WALLET_OPTIONAL

**Secret Variables** (server-side only)
- [ ] JWT_SECRET
- [ ] CLOUDINARY_API_SECRET

#### Deploy
```bash
vercel --prod
```
- [ ] Deployment succeeds
- [ ] URL provided
- [ ] Visit URL and test login
- [ ] Wallet connection works
- [ ] File upload works

### 9. Backend Deployment

#### Choose Hosting
Options:
- [ ] DigitalOcean App Platform
- [ ] AWS Elastic Beanstalk
- [ ] Heroku
- [ ] Railway
- [ ] Render

#### Prepare for Deployment
```bash
pip freeze > requirements.txt  # Already done
# Add this to requirements.txt:
# gunicorn==21.0.0
```

#### Create .env on Server
Copy content of `app/.env` (with real values):
- [ ] MONGO_URI set
- [ ] RPC_URL set
- [ ] PRIVATE_KEY set
- [ ] GROQ_API_KEY set
- [ ] PINATA credentials set
- [ ] CORS_ORIGINS updated to frontend URL
- [ ] PORT set to 8000 or service port

#### Deploy with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```
- [ ] Server started
- [ ] No errors
- [ ] Accessible at https://your-backend-url

### 10. Post-Deployment Testing

#### Test Endpoints
```bash
# Check API health
curl https://your-backend-url/health  # or similar

# Check database connection
curl https://your-backend-url/test-db

# Check blockchain connection
curl https://your-backend-url/test-blockchain
```
- [ ] Backend accessible
- [ ] Database connected
- [ ] Blockchain accessible

#### End-to-End Testing
From deployed frontend URL:
- [ ] Full signup flow works
- [ ] Login succeeds
- [ ] Wallet modal appears
- [ ] Wallet connection works
- [ ] File upload & analysis works
- [ ] Profile page functional
- [ ] Mobile responsive

#### Error Monitoring
- [ ] Set up error logging
- [ ] Monitor API errors
- [ ] Check backend logs
- [ ] Review wallet failures
- [ ] Track performance

### 11. Security Hardening

#### HTTPS
- [ ] Frontend: Vercel handles automatically
- [ ] Backend: Enable HTTPS certificate
- [ ] Update NEXT_PUBLIC_BACKEND_API_URL to https://

#### CORS
- [ ] Backend CORS_ORIGINS updated
- [ ] Only allow frontend domain

#### Database
- [ ] MongoDB: IP whitelist configured
- [ ] Database: Authentication required
- [ ] Backups: Set up automatic backups
- [ ] Encryption: Enable at-rest encryption

#### API Keys
- [ ] Rotate Pinata keys
- [ ] Rotate Groq API key
- [ ] Secure JWT secret stored
- [ ] No keys in git history

### 12. Monitoring & Logging

#### Set Up Monitoring
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Backend logs configured
- [ ] Database monitoring enabled

#### Create Alerts
- [ ] High error rate
- [ ] API timeout
- [ ] Database connection lost
- [ ] Wallet connection failures

### 13. Documentation Complete

- [ ] README updated
- [ ] DEPLOYMENT.md followed
- [ ] WALLET_FEATURE.md reviewed
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide ready

## Troubleshooting During Setup

### If Frontend Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### If Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Activate venv and reinstall
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload
```

### If Wallet Won't Connect
- [ ] MetaMask installed?
- [ ] MetaMask wallet created?
- [ ] Correct network selected?
- [ ] Browser console shows errors?

### If Environment Variables Not Loading
- [ ] Named correctly (.env.local for frontend)?
- [ ] NEXT_PUBLIC_ prefix for frontend vars?
- [ ] Dev server restarted?
- [ ] .env file saved with LF (not CRLF)?

## Go-Live Checklist

Final verification before production users:
- [ ] All tests passed
- [ ] Error monitoring active
- [ ] Backups configured
- [ ] Security hardened
- [ ] Documentation complete
- [ ] Team trained
- [ ] Support plan ready
- [ ] Rollback plan ready

## Post-Launch

### Week 1
- [ ] Monitor user signups
- [ ] Watch error logs
- [ ] Check wallet connection rates
- [ ] Monitor performance
- [ ] User feedback collected

### Week 2
- [ ] Fix reported bugs
- [ ] Optimize based on metrics
- [ ] Update documentation
- [ ] Plan improvements

### Ongoing
- [ ] Regular backups verified
- [ ] Security patches applied
- [ ] Performance monitored
- [ ] User support provided

## Contact for Help

If stuck, check in order:
1. Error message in console
2. DEPLOYMENT.md
3. WALLET_FEATURE.md
4. QUICKSTART.md
5. Browser DevTools (F12)
6. Server logs

## Success!

When all boxes are checked:
✅ MetaTrace is deployed and live!
✅ Users can sign up and login
✅ Users can connect wallets (optional)
✅ Files upload and are analyzed
✅ Mobile users have good experience
✅ Everything is documented

Congratulations! 🎉

---

**Created**: March 28, 2026
**Version**: 2.0.0
**Status**: Ready to Follow
