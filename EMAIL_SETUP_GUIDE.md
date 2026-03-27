# 📧 Email Service Setup - Complete

## ✅ What's Been Configured:

### 1. **Environment Variables** (.env.local)
```
GMAIL_EMAIL=metatrace04@gmail.com
GMAIL_APP_PASSWORD=chirag123
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. **Email Service Library** (lib/emailService.js)
- `sendPasswordResetEmail(email, resetLink)` - Sends styled HTML email with reset button
- `verifyEmailConfiguration()` - Checks if Gmail is properly connected
- Uses nodemailer with Gmail SMTP

### 3. **Updated API Endpoint** (pages/api/auth/forgot-password.js)
```
POST /api/auth/forgot-password
Request: { email: "user@example.com" }
Response: { message: "..." }
```
**What it does:**
1. ✅ Validates email exists in MongoDB
2. ✅ Generates 1-hour expiring JWT reset token
3. ✅ Sends HTML email with reset link to user
4. ✅ Reset link: `http://localhost:3000/reset-password?token=...`

### 4. **Password Reset Flow**
1. User enters email → `POST /api/auth/forgot-password`
2. Email sent with reset link containing JWT token
3. User clicks link → redirected to `/reset-password?token=...`
4. `/reset-password.js` page loads and extracts token
5. User enters new password → `POST /api/auth/reset-password`
6. Password updated in MongoDB
7. User redirected to login

---

## 🧪 How to Test:

### Step 1: Go to Forgot Password Page
```
http://localhost:3002/forgot-password
```

### Step 2: Enter Your Email
- Enter: `metatrace04@gmail.com` (or any email)
- Click "Send Reset Link"

### Step 3: Check Gmail
- Login to `metatrace04@gmail.com`
- Look for email titled "Reset your MetaTrace Password"
- Click the "Reset Password" button in the email

### Step 4: Set New Password
- Page `/reset-password?token=...` should load
- Enter new password (min 8 chars, special char required)
- Click "Reset Password"
- See success message
- Click "Go to Login"

### Step 5: Login with New Password
- Email: `metatrace04@gmail.com`
- Password: Your new password

---

## 🔒 Security Features:

✅ **Tokens expire in 1 hour** - Can't use old reset links
✅ **One-time use** - Token becomes invalid after password is reset
✅ **Password validation** - Min 8 chars + special character required
✅ **Hashed passwords** - bcryptjs with 10 salt rounds
✅ **Email doesn't leak** - Same response whether email exists or not

---

## 📝 Important Notes:

1. **For Production Deployment:**
   - Update `NEXT_PUBLIC_APP_URL` in `.env.local` to your domain
   - Example: `https://metatrace.yourdomainhere.com`

2. **If Email Not Working:**
   - Check: Is 2-Step Verification enabled on Gmail?
   - Create App Password: https://myaccount.google.com/apppasswords
   - Update `GMAIL_APP_PASSWORD` in `.env.local`

3. **Gmail App Password Steps:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
   - Replace `GMAIL_APP_PASSWORD` value in `.env.local`

4. **Test Email Account:**
   - Email: metatrace04@gmail.com
   - Can't be changed without user login
   - For production, change to your official email

---

## 📂 Files Created/Modified:

✅ `.env.local` - Added Gmail credentials
✅ `lib/emailService.js` - Email utility (NEW)
✅ `pages/api/auth/forgot-password.js` - Updated to send emails
✅ `pages/reset-password.js` - Password reset form (created earlier)
✅ `pages/api/auth/reset-password.js` - Reset handler (created earlier)
✅ `package.json` - Added nodemailer dependency

---

## 🎯 Next Steps:

1. **Test the flow** (instructions above)
2. **When deploying to production:**
   - Update `.env.local` with your domain URL
   - Use your brand email instead of test account
   - Consider using SendGrid for better deliverability

---

**Everything is ready! Test the forgot password flow now.** 🚀
