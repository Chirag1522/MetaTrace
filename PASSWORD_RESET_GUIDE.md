# 🔐 Password Reset Feature - Complete Setup Guide

## Overview
The password reset feature allows users to securely reset their forgotten passwords via email. This guide explains the complete flow and how to set it up.

## 🔄 Password Reset Flow

```
┌─────────────────┐
│  User Clicks    │
│  "Forgot Pwd?"  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  forgot-password.js Page            │
│  - User enters email                │
│  - Calls /api/auth/forgot-password  │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  /api/auth/forgot-password (Node.js Backend) │
│  ✅ Verify email exists in MongoDB            │
│  ✅ Generate JWT token (1 hour expiry)        │
│  ✅ Build reset link with NEXT_PUBLIC_APP_URL│
│  ✅ Send email with reset link               │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  User Receives Email                 │
│  - Contains reset link with JWT      │
│  - Link valid for 1 hour             │
└────────┬─────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│  User Clicks Link in Email                │
│  https://metatrace.vercel.app/reset-pwd? │
│  token=eyJhbGc...                        │
└────────┬────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  reset-password.js Page            │
│  ✅ Validates token from URL       │
│  ✅ Token validation logic:        │
│    - Token exists? ✓              │
│    - Token empty? ✗               │
│  ✅ Shows password reset form      │
└────────┬───────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  User Enters New Password           │
│  - Password strength validation     │
│  - Password confirmation check      │
│  - Calls /api/auth/reset-password   │
└────────┬─────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│  /api/auth/reset-password (Node.js)       │
│  ✅ Verify JWT token validity            │
│  ✅ Check token type: 'password-reset'   │
│  ✅ Check token not expired              │
│  ✅ Find user by ID from token           │
│  ✅ Hash new password with bcryptjs      │
│  ✅ Update password in MongoDB           │
│  ✅ Return success message               │
└────────┬───────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  reset-password.js Shows Success    │
│  Message to User                    │
│  "Password reset successfully"      │
└────────┬─────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  User Logs In with New Password     │
│  Account secured ✅                 │
└─────────────────────────────────────┘
```

## 🔧 Setup Requirements

### 1. **Environment Variables** (Critical!)

Create `/frontend/.env.local` with these variables:

```bash
# Application URL - CRITICAL for password reset emails!
NEXT_PUBLIC_APP_URL=https://metatrace.vercel.app
# For local dev: http://localhost:3000

# JWT Secret for signing reset tokens
JWT_SECRET=your-32-character-random-string-here-openssl-rand-base64-32

# Gmail SMTP credentials for sending reset emails
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# MongoDB for storing users
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/metatrace
```

### 2. **Gmail Setup** (Optional but Recommended)

If you want to send actual password reset emails:

1. Sign in to your Google Account
2. Go to [myaccount.google.com](https://myaccount.google.com)
3. Click **Security** in the left menu
4. Enable **2-Step Verification** (if not already enabled)
5. Go back to Security and click **App passwords**
6. Select "Mail" and "Windows Computer"
7. Google will generate a 16-character password
8. Copy this and paste it as `GMAIL_APP_PASSWORD` in `.env.local`

### 3. **JWT Secret Generation**

Generate a strong random secret:

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output to `JWT_SECRET` in `.env.local`

### 4. **MongoDB Setup**

Ensure your MongoDB instance has a `users` collection with these fields:

```javascript
{
  _id: ObjectId,
  email: string,
  password: string (hashed with bcryptjs),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment Checklist

### Local Development
```bash
# 1. Create .env.local
cp frontend/.env.local.example frontend/.env.local

# 2. Update .env.local with your values
# - NEXT_PUBLIC_APP_URL=http://localhost:3000
# - JWT_SECRET=your-generated-secret
# - GMAIL credentials (optional)
# - MONGODB_URI

# 3. Start frontend
cd frontend
npm install
npm run dev
```

### Vercel Deployment
```bash
# 1. Set environment variables in Vercel Dashboard
# Go to: Settings > Environment Variables
# Add all variables from .env.local:
# - NEXT_PUBLIC_APP_URL=https://metatrace.vercel.app
# - JWT_SECRET=your-secret
# - GMAIL_EMAIL
# - GMAIL_APP_PASSWORD
# - MONGODB_URI

# 2. Push to GitHub (auto-deploys on Vercel)
git push origin main

# 3. Verify deployment
# Test forgot password flow from https://metatrace.vercel.app/forgot-password
```

## 🐛 Debugging Password Reset Issues

### **Issue 1: Email Not Received**

**Cause:** Gmail credentials not set or GMAIL_APP_PASSWORD incorrect

**Fix:**
```bash
# 1. Verify GMAIL_APP_PASSWORD is correct (16 chars, from Google Account)
# 2. Check frontend logs for: "✅ Reset email sent" or "❌ Error sending"
# 3. Check spam folder
# 4. If using Gmail app password, ensure no extra spaces

# Test with this code in browser console:
fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
}).then(r => r.json()).then(console.log)
```

### **Issue 2: Reset Link Broken/Invalid**

**Cause:** `NEXT_PUBLIC_APP_URL` not set or incorrect

**Fix:**
```bash
# 1. Check NEXT_PUBLIC_APP_URL in .env.local
# 2. Verify it matches your deployment URL
#    - Local: http://localhost:3000
#    - Vercel: https://metatrace.vercel.app
#
# 3. If on Vercel, set in Dashboard:
#    Settings > Environment Variables
#    NEXT_PUBLIC_APP_URL=https://metatrace.vercel.app
#
# 4. Redeploy after changing
```

### **Issue 3: "Invalid Reset Link" with valid token**

**Possible Causes:**
- JWT_SECRET mismatch between forgot-password and reset-password endpoints
- Token expired (1 hour window)
- JWT_SECRET not set when deploying

**Fix:**
```bash
# 1. Verify JWT_SECRET is consistent across all environments
# 2. Check token expiry: Token expires 1 hour after generation
# 3. Ensure JWT_SECRET is set in all deployment environments:
#    - Local .env.local
#    - Vercel Environment Variables
#    - Docker (if using for backend)
#
# 4. Look at browser console for error details
```

### **Issue 4: "User not found" error**

**Cause:** Email doesn't exist in MongoDB or wrong database

**Fix:**
```bash
# 1. Check MONGODB_URI points to correct database
# 2. Verify user exists in MongoDB:
#    - Go to MongoDB Atlas
#    - Check 'users' collection
#    - Confirm user email matches exactly (case-sensitive!)
#
# 3. If user doesn't exist, sign up first
```

## 📊 Feature Checklist

- [x] **Forgot Password Page** (`/forgot-password`)
  - Email input with validation
  - Error messages
  - Success confirmation message
  
- [x] **Reset Password Page** (`/reset-password?token=...`)
  - Token validation from URL
  - Password strength indicator
  - Password confirmation matching
  - Token expiration handling
  
- [x] **API Endpoints**
  - `/api/auth/forgot-password` - Generate token & send email
  - `/api/auth/reset-password` - Verify token & update password
  
- [x] **Security Features**
  - JWT token with 1-hour expiry
  - Token type verification ('password-reset')
  - Password hashing with bcryptjs
  - Email verification (user exists)
  - Strong password requirements (8+ chars, special chars)
  
- [x] **Error Handling**
  - Invalid token → "Invalid Reset Link"
  - Expired token → "Reset link has expired"
  - User not found → Security message (no email leak)
  - Email send failure → Graceful fallback
  - MongoDB errors → Comprehensive logging

## 🔍 Testing Steps

### Manual Test (Local)
```
1. Go to http://localhost:3000/forgot-password
2. Enter your test email
3. Check Gmail inbox for reset email
4. Click reset link in email
5. Enter new password (8+ chars, 1 special char)
6. Confirm password
7. Should see "Password reset successfully!"
8. Go to login and sign in with new password
```

### Manual Test (Production)
```
1. Go to https://metatrace.vercel.app/forgot-password
2. Enter registered email
3. Check email inbox (Gmail, Outlook, etc.)
4. Click reset link
5. Create new password
6. Verify login works
```

### Testing with Invalid Token
```
1. Go to: https://metatrace.vercel.app/reset-password?token=invalid
2. Should show: "Invalid Reset Link"
3. Should have link to request new reset email
```

### Testing Expired Token
```
1. Generate a token and wait 1 hour
2. Try to use it
3. Should show: "Reset link has expired. Please request a new one."
```

## 📝 Code Structure

```
frontend/
├── pages/
│   ├── forgot-password.js              ← User requests password reset
│   ├── reset-password.js               ← User resets password with token
│   └── api/auth/
│       ├── forgot-password.js          ← Generates JWT & sends email
│       └── reset-password.js           ← Validates JWT & updates password
├── lib/
│   ├── emailService.js                 ← Nodemailer Gmail integration
│   └── mongodb.js                      ← MongoDB connection helper
└── .env.local.example                  ← Environment variable template
```

## 🔒 Security Best Practices

1. **JWT Secret**: Use strong, random string (32+ chars)
2. **Email Privacy**: Don't reveal if email exists (both API endpoints handled)
3. **Token Expiry**: 1 hour window prevents brute force
4. **HTTPS Only**: Always use HTTPS in production (`NEXT_PUBLIC_APP_URL=https://...`)
5. **Password Hashing**: bcryptjs with salt rounds = 10
6. **Error Messages**: Generic messages don't leak user existence
7. **Rate Limiting**: Consider adding rate limit to /forgot-password endpoint
8. **Email Validation**: Check MX records before sending (optional improvement)

## 🚨 Common Pitfalls

1. ❌ Forgetting to set `NEXT_PUBLIC_APP_URL` → Reset link points to wrong URL
2. ❌ Using different `JWT_SECRET` in different environments → Token validation fails
3. ❌ Not checking email credentials → Emails never arrive
4. ❌ Token expiry too short → Users can't reset in time
5. ❌ Not hashing password → Security vulnerability
6. ❌ Revealing user existence in error messages → Privacy leak

## ✅ Verification Checklist

After setup, verify:

- [ ] Environment variables set in `.env.local`
- [ ] NEXT_PUBLIC_APP_URL matches deployment URL
- [ ] JWT_SECRET is consistent across environments
- [ ] Gmail app password configured (if using email)
- [ ] MongoDB connection string correct
- [ ] Node.js server running (`npm run dev`)
- [ ] Can navigate to `/forgot-password` page
- [ ] Forgot password form submits without errors
- [ ] Reset link in email is clickable
- [ ] Reset password page loads with token
- [ ] New password can be set
- [ ] Login works with new password

## 📞 Support

For issues, check:
1. Browser console (F12) for error messages
2. Terminal logs for backend errors
3. MongoDB Atlas for user data
4. Gmail inbox spam folder
5. Vercel deployment logs (Settings > Analytics)

---

**Last Updated:** March 2026
**Version:** 1.0
**Status:** Production Ready ✅
