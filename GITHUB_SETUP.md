# 🚀 Step 1: GitHub Setup & Push Code

## Prerequisites
Download and install:
- **Git**: https://git-scm.com/download/win
- **GitHub Account**: https://github.com/signup (free)

---

## **A. Create GitHub Repository**

### Step 1: Go to GitHub
1. Open https://github.com
2. Login to your account
3. Click **"+"** → **"New repository"**

### Step 2: Create Repository
1. **Repository name**: `MetaTrace` (or any name)
2. **Description**: "Metadata forensics & visualization platform"
3. **Visibility**: Public (or Private if you prefer)
4. **Initialize repository**: Leave unchecked
5. Click **"Create repository"**

### Step 3: Copy Repository URL
You'll see a page with:
```
https://github.com/YOUR_USERNAME/MetaTrace.git
```
**Copy this URL** - you'll need it next.

---

## **B. Initialize Git Locally & Push Code**

### Step 1: Open PowerShell in Project Root
```powershell
cd "C:\Users\chirag\Downloads\major project\MetaTrace"
```

### Step 2: Initialize Git Repository
```powershell
git init
```
This creates a `.git` folder.

### Step 3: Check Files
```powershell
git status
```
You should see all your projects files listed as "Untracked files"

### Step 4: Add All Files
```powershell
git add .
```
This stages all files for commit.

### Step 5: Create Initial Commit
```powershell
git commit -m "Initial commit: MetaTrace project setup"
```

### Step 6: Rename Branch to "main"
```powershell
git branch -M main
```

### Step 7: Add Remote Repository
Replace `YOUR_USERNAME` with your GitHub username:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/MetaTrace.git
```

**Example:**
```powershell
git remote add origin https://github.com/chiragdulera/MetaTrace.git
```

### Step 8: Push to GitHub
```powershell
git push -u origin main
```

You might be asked to login:
- **If popup appears**: Click "Sign in with your browser"
- **If terminal prompt**: Enter your GitHub username & personal access token

---

## **C. Create Personal Access Token (If Needed)**

If you see authentication error:

### Step 1: Go to GitHub Settings
1. Click your profile icon (top right)
2. Click **"Settings"**
3. Click **"Developer settings"** (left sidebar, scroll down)
4. Click **"Personal access tokens"** → **"Tokens (classic)"**

### Step 2: Generate New Token
1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. **Token name**: `git-deployment`
3. **Expiration**: 90 days (or 1 year)
4. **Scopes**: Check:
   - ✅ `repo` (full control of repositories)
   - ✅ `workflow` (GitHub Actions)
5. Click **"Generate token"**

### Step 3: Copy Token
You'll see a long string like:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxx
```
**Copy this immediately** - you can't see it again!

### Step 4: Use Token for Authentication
When Git asks for password, paste this token instead.

---

## **D. Verify Push was Successful**

### Step 1: Check GitHub
1. Go to https://github.com/YOUR_USERNAME/MetaTrace
2. You should see all your files!

### Step 2: Verify in PowerShell
```powershell
git status
```
Should show:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

---

## **E. Verify Repository Structure**

Make sure GitHub shows:
```
MetaTrace/
├── frontend/          ✅ Next.js app
├── app/               ✅ FastAPI backend
├── file_types/        ✅ Data files
├── uploads/           ✅ User uploads
├── .gitignore         ✅ (should exist)
├── package.json       ✅ Root package file
├── README.md          ✅ Documentation
└── Other files...
```

---

## **F. Add .gitignore (IMPORTANT!)**

### Create `.gitignore` file in project root:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv
pip-log.txt
pip-delete-this-directory.txt

# Node
node_modules/
.next/
out/
build/
dist/
*.log

# Environment variables (NEVER commit these!)
.env
.env.local
.env.*.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite

# Build artifacts
/frontend/.next/
/frontend/out/

# Cache
.cache/
```

### Add and commit:
```powershell
git add .gitignore
git commit -m "Add .gitignore"
git push
```

---

## **G. Troubleshooting**

### ❌ Error: "repository not found"
**Fix**: Check your GitHub URL is correct
```powershell
git remote -v  # Shows your remote URL
git remote remove origin  # Remove wrong one
git remote add origin https://github.com/YOUR_USERNAME/MetaTrace.git  # Add correct one
git push -u origin main
```

### ❌ Error: "Permission denied (publickey)"
**Fix**: Generate SSH key instead
```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter when asked for passphrase (to skip)
cat $env:USERPROFILE\.ssh\id_ed25519.pub  # Copy this
```
Then:
1. Go to GitHub Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste the key
4. Use SSH URL: `git@github.com:YOUR_USERNAME/MetaTrace.git`

### ❌ Error: "fatal: the current branch main has no upstream branch"
**Fix**:
```powershell
git push -u origin main  # This sets upstream
```

---

## **H. Future Updates to GitHub**

After making changes locally:

```powershell
# Check changes
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push
```

---

## **Next Steps**

Once GitHub is confirmed working:
- ✅ Code is backed up
- ✅ Ready for Vercel deployment (frontend)
- ✅ Ready for Render deployment (backend)

**→ Next Guide: Deploy to Vercel** 🎯

---

## **Quick Reference**

| Command | What it does |
|---------|------------|
| `git status` | See what's changed |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Save changes |
| `git push` | Send to GitHub |
| `git pull` | Get latest from GitHub |
| `git log` | See commit history |

---

**Ready to push to GitHub?** Follow steps **A → B → D** and reply when done! ✅
