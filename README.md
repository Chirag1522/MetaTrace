# MetaTrace - Digital Image Forensics & Authentication Platform

## 🎯 Project Overview

MetaTrace is a **comprehensive blockchain-based image forensics and metadata authentication platform** that combines advanced image tampering detection, AI-powered analysis, and blockchain storage to ensure digital image authenticity and integrity. The platform provides forensic analysis, metadata inspection, and cryptographic proof of file authenticity on the Moonbase Alpha testnet.

### Core Mission
To provide photographers, journalists, legal professionals, and content creators with **cryptographic proof of image authenticity** through:
- Advanced forensic analysis (ELA, entropy, metadata consistency checks)
- AI-powered anomaly detection and recommendations
- Immutable blockchain records of file metadata
- Decentralized IPFS storage of images and forensic reports
- User wallet integration for ownership attribution

---

## 🏗️ Architecture Overview

MetaTrace follows a **three-layer architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER (Next.js)                  │
│  Runs on Vercel | Next.js 14+ | React | Wagmi/RainbowKit  │
│  • File upload UI with drag-drop                            │
│  • Real-time wallet connection (MetaMask, WalletConnect)    │
│  • Analysis results display with forensic findings          │
│  • Metadata inspector modal with blockchain links          │
│  • User profile & authentication management                │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/REST
┌──────────────────▼──────────────────────────────────────────┐
│             MIDDLEWARE LAYER (Node.js/Next.js API)          │
│  Runs on Render | Node.js | Formidable | MongoDB Driver    │
│  • File upload handler (/api/upload)                       │
│  • IPFS integration (Pinata SDK)                            │
│  • Blockchain transaction orchestration (Web3.js)          │
│  • MongoDB persistence layer                               │
│  • Metadata routing to FastAPI backend                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/FastAPI
┌──────────────────▼──────────────────────────────────────────┐
│           BACKEND LAYER (FastAPI/Python)                    │
│  Runs on Render (Docker) | Python 3.11 | FastAPI          │
│  • Image analysis (/upload) with tamper detection          │
│  • Groq Llama-3.3-70b AI recommendations (/recommend)      │
│  • ExifTool metadata extraction                            │
│  • Forensic image generation (ELA, entropy)                │
│  • CORS-enabled REST API with source-of-truth enforcement  │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/Web3
┌──────────────────▼──────────────────────────────────────────┐
│        EXTERNAL SERVICES & BLOCKCHAIN                       │
│  • Moonbase Alpha RPC (rpc.api.moonbase.moonbeam.network)  │
│  • Smart Contract (0xb51f74aa44AccD2d6fD0E8c0Bc78Af2c5819F197)
│  • Pinata IPFS Gateway (api.pinata.cloud)                 │
│  • MongoDB Atlas (m0+ cluster)                             │
│  • Groq Cloud API (llama-3.3-70b-versatile)               │
│  • Moonbase Explorer (moonbase.moonscan.io)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Features & Detailed Functionality

### 1. **Image Upload & Processing**

#### Frontend Flow (`pages/upload.js`)
```javascript
// User selects image → Frontend FormData includes:
// - file (binary)
// - email (string)
// - walletAddress (string, optional)

// Request: POST /api/upload
// Response: {
//   metadata: { ...exiftool data, tamper_report, fileHash },
//   blockchain: { txHash, uploadedByWallet },
//   walletConnected: boolean
// }
```

**Supported File Types:**
- JPEG/JPG (most common for forensics)
- PNG (lossless format)
- TIFF (archival quality)
- GIF, BMP, WebP (progressively added)

**Processing Pipeline (`pages/api/upload.js`):**

1. **Multipart Form Parsing** (Formidable)
   - Reads binary file from request
   - Extracts email and optional walletAddress
   - Validates file type and size

2. **IPFS Upload (Pinata)**
   ```javascript
   // Original image → Pinata IPFS
   // Returns: ipfsHash (QmXxxx...)
   // URL: https://gateway.pinata.cloud/ipfs/{ipfsHash}
   ```

3. **Backend Metadata Extraction** (FastAPI call)
   ```
   POST https://backend-url/upload/
   Receives: file binary + email
   Returns: {
     metadata: { exiftool data, fileHash, timestamp },
     tamper_report: { anomaly_score, integrity_score, findings },
     anomaly_score: integer (0-100),
     anomaly_detected: boolean,
     forensic_images: { ela_url, entropy_url }
   }
   ```

4. **Blockchain Storage Decision (Hybrid Logic)**
   - IF `walletAddress` provided → File marked `uploadedByWallet: 0x...`
   - IF NO wallet → File marked `uploadedByWallet: "default_backend"`
   - **Always** sent from backend account (0xb09554...) for reliability
   - `uploadedByWallet` field serves as **attribution**, not sender

5. **MongoDB Persistence**
   ```javascript
   {
     email: "user@example.com",
     filename: "photo.jpg",
     ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmXxxx",
     pinataCid: "QmXxxx",
     walletAddress: "0x12345...", // User's connected wallet (if any)
     uploadedByWallet: "0x12345..." or "default_backend", // Attribution
     metadata: { ...exiftool fields },
     tamper_report: { ...forensic findings },
     blockchain: {
       txHash: "0xabc123...",
       txExplorerUrl: "https://moonbase.moonscan.io/tx/0xabc...",
       uploadedByWallet: "0x12345..." or "default_backend"
     },
     uploadDate: ISOString
   }
   ```

---

### 2. **Forensic Analysis Engine** (`app/tamper_audit.py`)

#### Forensic Techniques (Implemented)

**1. Anomaly Score Calculation (0-100)**
```
Score = 95 → File appears CLEAN
Score < 90 → File appears TAMPERED

Components analyzed:
- EXIF data consistency (20 points max)
  * Camera make/model matches timestamps
  * Creation dates consistent across fields
  * GPS coordinates valid if present
  
- File magic bytes & structure (20 points max)
  * JPEG header validation
  * Segment sequencing
  * Compression anomalies
  
- Pixel entropy distribution (20 points max)
  * Unusual compression patterns
  * Copy-move detection zones
  * Splicing indicators
  
- Metadata completeness (20 points max)
  * Expected ExifTool fields present
  * Version tags consistent
  
- Historical analysis (20 points max)
  * Timestamp progression
  * Edit history in metadata
```

**2. Error Level Analysis (ELA)**
- Regenerates JPEG at 95% quality
- Compares original vs. regenerated pixels
- **High error zones** indicate tampering/splicing
- Output: PNG heatmap (`image.ela.png`)
- **Color meaning:**
  - Green: Low error (original)
  - Red: High error (edited area)

**3. Entropy Analysis**
- Calculates Shannon entropy per image region
- Compares against statistical baseline
- **Low entropy zones** = copy-pasted/cloned regions
- Output: PNG visualization (`image.entropy.png`)

**4. EXIF Inconsistency Detection**
```
Checks:
- DateTime_Original vs. DateTime_Digitized
- Camera Make vs. Model (firmware signatures)
- GPS DateTime validity
- Orientation tag matches actual image dimensions
- Software version progression (impossible jumps)
```

#### Score Determination Logic (`app/main.py` lines 431-482)

**Priority Hierarchy (Source of Truth):**
1. **Loaded tamper_report** (from `/upload` endpoint)
   - Path: `metadata.tamper_report.anomaly_score`
   - Authoritative: YES
   
2. **Payload metadata** (nested in request)
   - Path: `payload.metadata.tamper_report.anomaly_score`
   - Authoritative: YES if loaded_report is None
   
3. **File-based report** (fallback)
   - Path: `./uploads/{filename}.tamper_report.json`
   - Authoritative: YES if previous two unavailable
   
4. **Fallback calculation**
   ```
   if no score found:
     score = 75 (conservative default)
     anomaly_detected = false
     status = "normal"
   ```

**Critical Enforcement (Lines 710-713):**
```python
final_response = {
    "anomaly_detected": actual_anomaly_detected,  # 🔴 FROM FORENSICS
    "risk_level": actual_risk_level,              # 🔴 FROM FORENSICS
    "integrity_score": actual_integrity_score,    # 🔴 FROM FORENSICS
    # ... rest of AI analysis (can be overridden)
}
```

**Why this matters:**
- Groq (AI model) could be convinced to change verdicts
- Forensic scores are **immutable facts** from image analysis
- AI only provides **explanation**, not **verdict**
- "Source of truth" prevents AI hallucination injection

---

### 3. **AI-Powered Recommendations** (`/recommend` Endpoint)

#### Groq Llama-3.3-70b Integration

**Why Groq over Google Gemini:**
- ✅ 70B parameter model (more intelligent)
- ✅ <2 second response time (vs. 5-10s for Gemini)
- ✅ Cheaper pricing ($0.27/$0.81 per 1M tokens)
- ✅ Better for JSON output parsing
- ✅ Handles large context windows
- ✅ Deterministic behavior

**Prompt Structure:**

```markdown
🔴 VERDICT ALREADY DETERMINED:
   Score: 95/100
   Rule: score >= 90 → CLEAN, < 90 → TAMPERED
   Current: anomaly_detected = false

Your role:
1. DO NOT change verdict (it's final)
2. EXPLAIN WHY score is 95
3. List forensic findings
4. Provide recommendations

Full Forensic Report:
{JSON metadata with all fields}

REQUIRED JSON OUTPUT:
{
  "anomaly_detected": false,       ← MUST match forensic
  "risk_level": "low",             ← MUST match forensic
  "integrity_score": 95,           ← MUST match forensic
  "technical_analysis": "...",     ← Can be AI-generated
  "recommendations": [...],        ← AI creates these
  "metadata_summary": {...}        ← Formatted explanation
}
```

**Groq API Call:**
```python
response = groq_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,  # Balanced: deterministic but creative
    max_tokens=2048   # Enough for full analysis + JSON
)
```

**Fallback Mechanism** (if Groq fails):
```python
# If Groq times out or API error:
return {
    "anomaly_detected": actual_anomaly_detected,  # Use forensic
    "risk_level": actual_risk_level,              # Use forensic
    "integrity_score": actual_integrity_score,    # Use forensic
    "reason": "AI analysis unavailable.",         # Explain gap
    "recommendations": ["Review findings above"], # Safe default
}
```

---

### 4. **Blockchain Integration** (Moonbase Alpha Testnet)

#### Smart Contract (`0xb51f74aa44AccD2d6fD0E8c0Bc78Af2c5819F197`)

**Contract Functions:**

```solidity
function storeMetadata(uint256 tokenId, string jsonData) 
  - Stores: { filename, ipfsHash, score, anomaly_detected, timestamp, uploadedByWallet }
  - Gas: ~150,000-300,000 (depends on JSON size)
  - Cost: ~0.01-0.05 DEV tokens (testnet)
  - Returns: Transaction hash
```

**Transaction Flow:**

```javascript
// Frontend/API generates metadata object:
const dataToStore = {
  originalFilename: "photo.jpg",
  fileHash: "sha256hash...",
  ipfsHash: "QmXxxx...",
  anomaly_score: 95,
  anomaly_detected: false,
  uploadedByWallet: "0x123..." || "default_backend",
  timestamp: "2026-03-28T15:30:00Z",
  ...forensic_findings
};

// Convert to JSON string (max size: ~130KB per transaction)
const jsonString = JSON.stringify(dataToStore);

// Estimate gas:
const estimated = await contract.methods
  .storeMetadata(1, jsonString)
  .estimateGas({ from: account.address });

// Send transaction:
const tx = await contract.methods
  .storeMetadata(1, jsonString)
  .send({
    from: account.address,           // Backend account
    gas: estimated * 1.3,            // 30% buffer
    gasPrice: await web3.eth.getGasPrice()
  });

// Returns: tx.transactionHash = "0xabc123..."
```

**Transaction Explorer Link:**
```
https://moonbase.moonscan.io/tx/{txHash}
```

**View Contract Data:**
```
https://moonbase.moonscan.io/address/0xb51f74aa44AccD2d6fD0E8c0Bc78Af2c5819F197
```

#### RPC Configuration

**Network Details:**
- Network ID: 1287 (Moonbase Alpha)
- RPC URL: `https://rpc.api.moonbase.moonbeam.network`
- Block time: ~12 seconds
- Finality: ~12 blocks (~2 minutes)

**Network Switching in Frontend:**

```javascript
// User switches network via RainbowKit dropdown
// Wagmi hook detects: useNetwork() → network.id === 1287
// If NOT on testnet:
const { switchNetwork } = useSwitchNetwork();
// Call: switchNetwork(1287);
```

---

### 5. **IPFS Storage via Pinata**

#### How It Works

**Step 1: Image Upload to IPFS**
```javascript
// Multipart upload to Pinata
POST https://api.pinata.cloud/pinning/pinFileToIPFS

Form Data:
- file: <binary image>
- pinataMetadata: { name: "photo.jpg" }
- pinataOptions: { cidVersion: 1 }

Response:
{
  IpfsHash: "QmXxxx...",  // IPFS content hash
  PinSize: 256789,        // File size in bytes
  Timestamp: "2026-03-28T15:30:00.000Z"
}
```

**Step 2: Forensic Images Upload**
```javascript
// After ELA and entropy generation:
// /uploads/photo.jpg.ela.png → Pinata → QmYyyy...
// /uploads/photo.jpg.entropy.png → Pinata → QmZzzz...

// Returned in response:
"forensic_images": {
  "ela_ipfs_hash": "QmYyyy...",
  "ela_url": "https://gateway.pinata.cloud/ipfs/QmYyyy...",
  "entropy_ipfs_hash": "QmZzzz...",
  "entropy_url": "https://gateway.pinata.cloud/ipfs/QmZzzz..."
}
```

**Step 3: View via Gateway**
```
https://gateway.pinata.cloud/ipfs/QmXxxx...
→ Returns original image (permanent)
```

#### Benefits
- ✅ Content-addressable (QmXxxx... = file hash)
- ✅ Immutable data (cannot be changed)
- ✅ Permanent (as long as Pinata node is online)
- ✅ No custom storage server needed
- ✅ Decentralized retrieval from IPFS network

---

### 6. **Wallet Integration** (Wagmi + RainbowKit)

#### User Connection Flow

```javascript
// pages/upload.js uses useAccount() hook
const { address, isConnected } = useAccount();

// If isConnected:
//   - Store address in localStorage: "walletAddress"
//   - Send to backend in FormData: formData.append("walletAddress", address)
//   - Backend marks: uploadedByWallet = "0x123..."
//   - Frontend shows: "Uploaded by 0x123..."

// If NOT connected:
//   - walletAddress = null/undefined
//   - Backend marks: uploadedByWallet = "default_backend"
//   - Frontend shows: "Uploaded by MetaTrace Backend"
```

#### Network Support

**Configured in `frontend/lib/wagmi-config.js`:**
```javascript
import { mainnet, polygon, moonbaseAlpha } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, polygon, moonbaseAlpha],  // Available networks
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [moonbaseAlpha.id]: http(RPC_URL),
  },
});
```

**User Responsibility:**
- Switch network to Moonbase Alpha in wallet UI
- Wagmi detects network switch via `useNetwork()`
- Transactions fail if user is on wrong network

---

### 7. **User Authentication**

#### Email/Password Authentication (`pages/auth/`)

**Signup Flow:**
```
User fills signup form:
- email: "user@example.com"
- password: "secret123"
- name: "John Doe"

POST /api/auth/signup
- Validates email format
- Checks if user exists
- Hashes password (bcrypt)
- Creates MongoDB doc: { email, passwordHash, name, createdAt }
- Returns: JWT token (stored in httpOnly cookie)
```

**Login Flow:**
```
User fills login form:
- email: "user@example.com"
- password: "secret123"

POST /api/auth/login
- Finds user by email
- Compares password hash
- If match: Generate JWT + httpOnly cookie
- If fail: Return 401 Unauthorized
```

**Protected Routes:**
```javascript
// pages/protected.js (example)
if (!isAuthenticated) redirect("/login");
// Only logged-in users can access
```

**Credential Persistence:**
- JWT stored in **httpOnly cookie** (secure, not accessible via JS)
- Automatically sent with each request
- Verified on protected routes

#### Google OAuth Integration (`pages/auth/google.js`)

**Flow:**
1. User clicks "Sign in with Google"
2. Frontend calls Google OAuth dialog
3. User authorizes MetaTrace app
4. Google returns `idToken` (JWT from Google)
5. Backend verifies idToken with Google servers
6. If valid: Create/update user in MongoDB
7. Return MetaTrace JWT

---

### 8. **Metadata Inspector Features**

#### MetadataModal Component (`components/MetadataModal.js`)

**What's Displayed:**

```javascript
{
  fileInfo: {
    Filename: "photo.jpg",
    FileSize: "2.5 MB",
    FileModifyDate: "2026-03-28",
    MIMEType: "image/jpeg"
  },
  cameraInfo: {
    Make: "Canon",
    Model: "EOS 5D",
    LensModel: "EF 24-70mm f/2.8"
  },
  captureSettings: {
    DateTimeOriginal: "2026-03-28 14:30:00",
    ExposureTime: "1/1000",
    FNumber: "f/2.8",
    ISO: "100",
    FocalLength: "50mm"
  },
  advancedMetadata: {
    ColorSpace: "sRGB",
    Software: "Adobe Lightroom 6.1",
    ProcessingSoftware: "...",
    Orientation: "Horizontal (normal)"
  },
  blockchainProof: {
    TransactionHash: "0xabc...",
    BlockNumber: 12345,
    Timestamp: "2026-03-28T15:30:00Z",
    UploadedByWallet: "0x123..." or "default_backend"
  }
}
```

**View Transaction Link:**
```javascript
// pickTxHash() searches 8 locations:
1. blockchainData.txHash
2. blockchainData.transactionHash
3. metadata.blockchain.txHash
4. metadata.blockchain.transactionHash
5. metadata.txHash
6. metadata.transactionHash
7. data.txHash
8. data.transactionHash

if (txHash found) {
  renderLink: 
  <a href="https://moonbase.moonscan.io/tx/{txHash}">
    View on Blockchain →
  </a>
} else {
  renderMessage:
  "Transaction link unavailable for this record"
}
```

---

## 🔧 Installation & Setup Guide

### Prerequisites
```bash
# Node.js 18+ (check: node --version)
# Python 3.11 (check: python --version)
# Git (check: git --version)
# Docker (optional, for containerized backend)
```

### Frontend Setup (Next.js)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local with:
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret
NEXT_PUBLIC_MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
NEXT_PUBLIC_DB_NAME=testdb
NEXT_PUBLIC_CONTRACT_ADDRESS=0xb51f74aa44AccD2d6fD0E8c0Bc78Af2c5819F197
NEXT_PUBLIC_RPC_URL=https://rpc.api.moonbase.moonbeam.network
NEXT_PUBLIC_BLOCKCHAIN_PRIVATE_KEY=your_backend_private_key

# 4. Start development server
npm run dev
# Runs on http://localhost:3000
```

### Backend Setup (FastAPI)

```bash
# 1. Navigate to app directory
cd app

# 2. Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Install system dependency (ExifTool)
# On macOS: brew install exiftool
# On Ubuntu: sudo apt-get install exiftool
# On Windows: choco install exiftool

# 5. Create .env file with:
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret

# 6. Run FastAPI server
python -m uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
# Swagger docs on http://localhost:8000/docs
```

### Docker Setup (Optional)

```bash
# 1. Build Docker image
cd app
docker build -t metatrace-backend:latest .

# 2. Run container
docker run \
  -e GROQ_API_KEY=your_key \
  -e NEXT_PUBLIC_PINATA_API_KEY=your_key \
  -p 8000:8000 \
  metatrace-backend:latest
```

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://vercel.com
# 3. Connect GitHub repository
# 4. Vercel auto-detects Next.js
# 5. Add environment variables:
NEXT_PUBLIC_PINATA_API_KEY
NEXT_PUBLIC_PINATA_SECRET_API_KEY
NEXT_PUBLIC_MONGO_URI
NEXT_PUBLIC_DB_NAME
NEXT_PUBLIC_CONTRACT_ADDRESS
NEXT_PUBLIC_RPC_URL
NEXT_PUBLIC_BLOCKCHAIN_PRIVATE_KEY

# 6. Deploy
# Automatic on every push to main
# Runs: npm install && npm run build && npm start
# URL: https://metatrace-<random>.vercel.app
```

### Backend Deployment (Render.com)

```bash
# 1. Create account on render.com
# 2. Connect GitHub repository
# 3. Create new "Web Service"
# 4. Configure:
   Build Command: ./app/entrypoint.sh
   Start Command: gunicorn -w 2 -b 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker main:app
   
# 5. Add environment variables:
   GROQ_API_KEY
   NEXT_PUBLIC_PINATA_API_KEY
   NEXT_PUBLIC_PINATA_SECRET_API_KEY
   
# 6. Deploy
# Service runs on: https://metatrace-backend.onrender.com
# First startup may take 30-60 seconds (cold start)
```

---

## 📡 API Endpoints Reference

### Authentication Endpoints

**POST /api/auth/signup**
```javascript
Request: {
  email: "user@example.com",
  password: "secret123",
  name: "John"
}
Response: { token: "jwt...", user: { email, name } }
Status: 201 Created
```

**POST /api/auth/login**
```javascript
Request: { email: "user@example.com", password: "secret123" }
Response: { token: "jwt...", user: { email, name } }
Status: 200 OK
```

### File Upload Endpoints

**POST /api/upload** (Frontend API Route)
```javascript
// Frontend
Request: FormData {
  file: <binary>,
  email: "user@example.com",
  walletAddress: "0x123..." (optional)
}

Response: {
  metadata: {
    filename: "photo.jpg",
    fileHash: "sha256...",
    tamper_report: { anomaly_score, findings },
    ...exiftool fields
  },
  blockchain: { txHash, uploadedByWallet, txExplorerUrl },
  walletConnected: true/false,
  forensic_images: { ela_url, entropy_url }
}
Status: 200 OK
```

**Backend /upload/** (FastAPI)
```python
# What frontend calls internally
POST https://backend-url/upload/
Form Data:
  file: <binary>
  email: "user@example.com"

Response: {
  metadata: { ...exiftool fields, fileHash, timestamp },
  tamper_report: { anomaly_score, anomaly_detected, status, findings },
  anomaly_score: 95,
  anomaly_detected: false,
  forensic_images: { ela_url, entropy_url }
}
```

**Backend /recommend** (FastAPI)
```python
POST https://backend-url/recommend/
Request: { 
  metadata: { tamper_report, ...fields }
}
Response: {
  anomaly_detected: false,
  risk_level: "low",
  integrity_score: 95,
  technical_analysis: "AI explanation...",
  recommendations: ["..."],
  metadata_summary: { brief_summary, authenticity, metadata_table, use_cases }
}
```

### File Retrieval Endpoints

**GET /api/files?email=user@example.com** (Frontend)
```javascript
Response: [
  {
    _id: "mongodb_id",
    filename: "photo.jpg",
    email: "user@example.com",
    ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmXxxx...",
    uploadDate: "2026-03-28T15:30:00Z",
    metadata: { ...full metadata },
    blockchain: { txHash, uploadedByWallet },
    uploadedByWallet: "0x123..." or "default_backend"
  },
  ...
]
Status: 200 OK
```

**GET /api/getMetadata?id=<mongodb_id>** (Frontend)
```javascript
Response: {
  filename: "photo.jpg",
  metadata: { ...all exiftool fields },
  tamper_report: { anomaly_score, findings },
  blockchain: { txHash, timestamp },
  uploadedByWallet: "0x123..." or "default_backend"
}
```

### Deletion Endpoints

**DELETE /api/deleteFile?id=<mongodb_id>** (Frontend)
```javascript
Request: DELETE request with MongoDB ID
Response: { message: "File deleted successfully" }
Status: 200 OK

Side effects:
- Remove from MongoDB
- Unpin from Pinata IPFS (calls pinata unpinAPI)
- Image no longer accessible via IPFS gateway
```

---

## 🗄️ Database Schema

### MongoDB Collections

**uploads Collection**
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  filename: "photo.jpg",
  ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmXxxx...",
  pinataCid: "QmXxxx...",
  type: "image/jpeg",
  size: 2560000,  // bytes
  uploadDate: ISODate("2026-03-28T15:30:00.000Z"),
  
  // Metadata from exiftool
  metadata: {
    SourceFile: "./uploads/photo.jpg",
    FileSize: "2.5 MB",
    FileType: "JPEG",
    MIMEType: "image/jpeg",
    ExifImageWidth: 4000,
    ExifImageHeight: 3000,
    Make: "Canon",
    Model: "EOS 5D",
    DateTimeOriginal: "2026-03-28T14:30:00",
    // ...100+ more fields from ExifTool
    fileHash: "sha256hash...",
    originalFilename: "photo.jpg",
    uploaderEmail: "user@example.com",
    timestamp: "2026-03-28T15:30:00Z",
    
    // Forensic report nested
    tamper_report: {
      anomaly_score: 95,
      anomaly_detected: false,
      status: "normal",
      findings: [ "No significant anomalies detected" ],
      ela_analysis: "Low error regions indicate origina...",
      entropy_analysis: "Normal entropy distribution"
    }
  },
  
  // Blockchain proof
  blockchain: {
    txHash: "0xabc123...",
    txExplorerUrl: "https://moonbase.moonscan.io/tx/0xabc...",
    uploadedByWallet: "0x123..." or "default_backend",
    blockNumber: 12345,
    timestamp: "2026-03-28T15:30:00Z"
  },
  
  // Top-level fields for querying
  txHash: "0xabc123...",
  txExplorerUrl: "https://moonbase.moonscan.io/tx/0xabc...",
  uploadedByWallet: "0x123..." or "default_backend",
  walletAddress: "0x123...",  // User's wallet if connected
}
```

**users Collection**
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  passwordHash: "bcrypthash...",
  name: "John Doe",
  createdAt: ISODate("2026-03-28T15:30:00.000Z"),
  updatedAt: ISODate("2026-03-28T15:30:00.000Z")
}
```

---

## 🔐 Security & Best Practices

### Environment Variables (NEVER commit these)

```bash
# Frontend (.env.local)
NEXT_PUBLIC_PINATA_API_KEY=xxx         # Public (safe to expose)
NEXT_PUBLIC_PINATA_SECRET_API_KEY=xxx  # Secret (should NOT be public)
NEXT_PUBLIC_MONGO_URI=xxx              # May contain password
NEXT_PUBLIC_BLOCKCHAIN_PRIVATE_KEY=xxx # Dangerous! Backend account

# Backend (.env)
GROQ_API_KEY=xxx                       # Secret (API key)
PINATA_API_KEY=xxx
PINATA_SECRET_API_KEY=xxx
```

### Private Key Management

**Critical Security Note:**
```
Backend private key (0xb09554...) is stored in environment variables.
This account sends blockchain transactions.

Risk mitigation:
1. Use testnet private key (no real funds)
2. Rotate key if compromised
3. Never commit to git
4. Limit transaction amount per upload
5. Monitor transaction history

DO NOT use same key for mainnet!
```

### Password Hashing

```javascript
// Frontend → Backend: HTTPS only (TLS encryption)
// Backend stores: bcrypt hash (never plaintext)
// Comparison: bcrypt.compare(password, hash)
// Cost factor: 10 rounds (good balance of speed/security)
```

### CORS Configuration

```python
# Backend (FastAPI) allows:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: specify domains
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Data Validation

```javascript
// Frontend validates:
- File type (extensions: jpg, png, jpeg, etc.)
- File size (max 50MB)
- Email format (RFC 5322)
- Wallet address format (0x + 40 hex chars)

// Backend validates:
- File MIME type (image/jpeg, etc.)
- Multipart form integrity
- Email existence
- MongoDB injection prevention (Mongoose)
```

---

## 🐛 Troubleshooting Guide

### Common Issues

**1. "File upload stuck at loading"**
```
Cause: Backend not responding
Fix:
- Check backend is running: http://localhost:8000/docs
- Verify BACKEND_API_URL in frontend/.env.local
- Check network tab in DevTools for failed requests
- Ensure Render backend is not on "Free" plan (sleeps after 15 min)
```

**2. "Blockchain transaction failed"**
```
Cause options:
a) User on wrong network (not Moonbase Alpha)
   Fix: MetaMask UI → Switch to "Moonbase Alpha"

b) Gas estimation failed
   Fix: Increase gas limit in upload.js to 3000000

c) Insufficient funds
   Fix: Get testnet MOONEYE from faucet:
       https://faucet.moonbeam.network/

d) Contract not found
   Fix: Verify CONTRACT_ADDRESS matches deployed address
```

**3. "ExifTool not found" (Backend error)**
```
Cause: ExifTool not installed
Fix:
- macOS: brew install exiftool
- Ubuntu: sudo apt-get install exiftool exiftool-doc
- Windows: choco install exiftool
- Docker: Already included in Dockerfile
```

**4. "Groq API error: timeout"**
```
Cause: API overloaded or network issue
Fix:
- Check GROQ_API_KEY validity
- Verify internet connection
- Increase timeout in main.py (line ~597)
- Fallback response is used (shows forensic score only)
```

**5. "MongoDB connection refused"**
```
Cause: Connection string invalid or server down
Fix:
- Verify NEXT_PUBLIC_MONGO_URI format:
  mongodb+srv://username:password@cluster.mongodb.net/dbname
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for dev)
- Test connection: mongosh "mongodb+srv://..."
```

**6. "Metadata Modal showing no transaction link"**
```
Cause: txHash not in database (upload before fix)
Fix:
- Re-upload the file (new uploads will have txHash)
- Check if blockchain transaction was successful
- View transaction manually on Moonbase Explorer
```

---

## 📊 Performance Metrics

### Upload Timing Breakdown

| Step | Duration | Notes |
|------|----------|-------|
| File upload to API | 2-5s | Depends on file size |
| IPFS upload (Pinata) | 3-10s | Network variance |
| Backend analysis | 15-30s | Tamper audit takes time |
| Blockchain tx | 2-5s | Moonbase block time |
| **Total** | **25-50s** | User sees results |

### File Size Limits

| Component | Limit | Impact |
|-----------|-------|--------|
| Frontend upload | ~500MB | Browser memory |
| IPFS file size | ~1GB | Pinata quota |
| Blockchain JSON | ~130KB | Smart contract gas |
| MongoDB document | 16MB | MongoDB limit |

### Cost Analysis (Monthly for 1,000 Uploads)

| Service | Cost |
|---------|------|
| Pinata IPFS | $20 (50GB storage) |
| Groq API | $0.27 per 1M input tokens (~$5) |
| MongoDB Atlas | Free tier (< 512MB) |
| Moonbase Alpha | Free (testnet) |
| Render backend | $7/month (Pro plan to avoid cold starts) |
| Vercel frontend | Free tier included |
| **Total** | **~$32/month** |

---

## 🤝 Contributing Guidelines

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes following code style
# Frontend: ESLint configured (npm run lint)
# Backend: Black formatter (black app/*.py)

# 3. Test locally
npm run dev          # Frontend
python -m pytest     # Backend (if tests exist)

# 4. Commit with clear message
git commit -m "Feat: Add feature description"

# 5. Push to GitHub
git push origin feature/your-feature-name

# 6. Create Pull Request
# Include:
# - What changed
# - Why it changed
# - How to test
```

### Code Style

**Frontend (JavaScript/React):**
- ESLint rules enforced
- Prettier formatting
- Component-based structure
- Hooks for state management

**Backend (Python):**
- Black formatter (line length: 88)
- Type hints for functions
- Docstrings for modules
- FastAPI route patterns

---

## 📚 Additional Resources

### Learning Resources
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/)
- [Web3.js Documentation](https://docs.web3js.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Moonbeam Network Docs](https://docs.moonbeam.network/)

### Testnet Faucets
- Moonbase Alpha: https://faucet.moonbeam.network/
- Request test tokens for gas

### Tools & Explorers
- Moonbase Explorer: https://moonbase.moonscan.io/
- Contract Verification: https://moonbase.moonscan.io/verify-contract
- MetaMask: https://metamask.io/

---

## 📝 License

MIT License - See LICENSE file

---

## 👥 Support & Contact

For issues, questions, or suggestions:
1. Check this README thoroughly
2. Search existing GitHub issues
3. Create new issue with detailed description
4. Include error logs and system info

---

**Last Updated:** March 28, 2026  
**Version:** 1.0.0  
**Maintainers:** MetaTrace Team
