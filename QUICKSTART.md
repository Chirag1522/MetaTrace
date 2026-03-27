# MetaTrace Development Quick Start

## Quick Setup (5 minutes)

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### Backend
```bash
cd app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env from .env.example
uvicorn main:app --reload
```

## Key Files Modified

### Wallet Feature
- `frontend/components/WalletConnectModal.js` - New modal component
- `frontend/components/Navbar.js` - Added auth check, mobile menu, responsive design
- `frontend/components/ProfileCard.js` - Added wallet management
- `frontend/pages/upload.js` - Added wallet modal integration

### Environment Configuration
- `frontend/.env.local` - Frontend environment variables
- `frontend/.env.example` - Template with examples
- `app/.env.example` - Backend environment template

### Documentation
- `DEPLOYMENT.md` - Deployment guide with all steps
- `WALLET_FEATURE.md` - Wallet integration details
- `README.md` - Main project documentation (keep updated)

## Environment Variables Required

### Frontend (.env.local)
```
NEXT_PUBLIC_MONGO_URI=...
NEXT_PUBLIC_RPC_URL=...
NEXT_PUBLIC_CONTRACT_ADDRESS=...
NEXT_PUBLIC_PINATA_API_KEY=...
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
JWT_SECRET=...
```

### Backend (.env)
```
MONGO_URI=...
RPC_URL=...
PRIVATE_KEY=...
GROQ_API_KEY=...
```

## Common Tasks

### Testing Wallet Connection
1. Run frontend: `npm run dev` (in frontend folder)
2. Run backend: `uvicorn main:app --reload` (in app folder)
3. Go to http://localhost:3000/login
4. Create test account
5. Login and test wallet modal

### Building for Production
```bash
# Frontend
npm run build
npm start

# Backend (with gunicorn)
pip install gunicorn
gunicorn -w 4 main:app
```

### Deploying Environment Variables
**For Vercel:**
1. Dashboard → Settings → Environment Variables
2. Add all variables from `.env.local` with `NEXT_PUBLIC_` prefix
3. Add `JWT_SECRET` as secret variable
4. Redeploy

## API Endpoints

### User Authentication
- POST `/api/auth/signup` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/update-profile` - Update profile

### File Management
- POST `/api/upload` - Upload file (includes wallet address)
- GET `/api/files` - List user files
- GET `/api/upload` - Get file metadata
- DELETE `/api/deleteFile` - Delete file

### Blockchain
- POST `{BACKEND_API_URL}/upload/` - Send to metadata extraction
- POST `{BACKEND_API_URL}/recommend` - Get AI recommendations

## Responsive Design Breakpoints

```
Mobile:   < 640px   (sm)
Tablet:   640px     (md: 768px)
Desktop:  1024px+   (lg)
```

Every page uses these breakpoints:
- Hidden classes: `hidden md:block`, `hidden sm:flex`
- Responsive text: `text-sm sm:text-base md:text-lg`
- Responsive padding: `px-4 sm:px-6 md:px-9`

## Debugging

### Check Environment Variables
```javascript
console.log(process.env.NEXT_PUBLIC_MONGO_URI)  // Frontend
console.log(os.getenv('MONGO_URI'))              # Backend
```

### Test API Connection
```bash
curl http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### Check Wallet
```javascript
console.log(localStorage.getItem('walletAddress'))
console.log(localStorage.getItem('token'))
```

## Important Notes

⚠️ **Never commit:**
- `.env` files
- `.env.local` files
- Private keys
- API credentials

✅ **Always commit:**
- `.env.example` templates
- `.gitignore` entries
- Documentation files

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change port
uvicorn main:app --port 8001 --reload
```

### MongoDB Connection Failed
- Verify MONGO_URI format
- Check IP whitelist in Atlas
- Test connection string in MongoDB Compass

### MetaMask Won't Connect
- Clear browser cache
- Check if MetaMask is unlocked
- Verify network selection in MetaMask
- Check browser console for errors

### Wallet Address Not Saving
- Check browser localStorage
- Verify no errors in console
- Ensure wallet connection completed
- Check localStorage permissions

## Performance Tips

1. Use `.env.local` for local development
2. Cache API responses when possible
3. Optimize images (Next.js Image component)
4. Use code splitting (Next.js automatic)
5. Monitor bundle size: `npm run build -- --analyze`

## Security Checklist

- [ ] Never log sensitive data
- [ ] Use HTTPS in production
- [ ] Validate all user input
- [ ] Sanitize database queries
- [ ] Use environment variables
- [ ] Rotate secrets regularly
- [ ] Enable rate limiting
- [ ] Use strong passwords for tests
- [ ] Keep dependencies updated
- [ ] Review CORS configuration

## Next Steps

1. **Test**: Run full test suite
2. **Deploy**: Use DEPLOYMENT.md guide
3. **Monitor**: Log errors and usage
4. **Scale**: Add more features as needed
5. **Secure**: Implement security best practices

## Support Resources

- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Ethers.js: https://docs.ethers.org
- MongoDB: https://docs.mongodb.com
- FastAPI: https://fastapi.tiangolo.com

## Version Info

- Node.js: 16+
- Python: 3.8+
- Next.js: 13+
- React: 18+
- Tailwind CSS: 3+
