# 🚀 Fresh Vercel Deployment Guide

## 📁 New Clean Project Structure

I've created a fresh `cortex-mobile/` folder with a clean Vercel deployment setup:

```
cortex-mobile/
├── src/                 # React source code (copied from admin-ui)
├── public/             # Static assets + PWA manifest
├── package.json        # Clean dependencies
├── vite.config.ts      # Production-optimized config
├── vercel.json         # Vercel deployment config
├── .env.local          # Local development
├── .env.production     # Production environment
├── tsconfig.json       # TypeScript config
└── index.html          # PWA-ready HTML
```

## 🎯 Step-by-Step Deployment

### 1. Install Dependencies
```bash
cd cortex-mobile
npm install
```

### 2. Test Local Build
```bash
# Test the build locally
npm run build
npm run preview

# Should open on http://localhost:4173
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from cortex-mobile directory
cd cortex-mobile
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account  
# - Link to existing project? No
# - Project name: cortex-mobile (or your preferred name)
# - Directory: ./ (current directory)
# - Override settings? No
```

#### Option B: GitHub + Vercel Dashboard
```bash
# 1. Create new GitHub repository
# 2. Push cortex-mobile folder to GitHub
# 3. Go to vercel.com/dashboard
# 4. Click "New Project"
# 5. Import from GitHub
# 6. Select your repository
# 7. Configure:
#    - Framework Preset: Vite
#    - Root Directory: cortex-mobile (if needed)
#    - Build Command: npm run build
#    - Output Directory: dist
```

### 4. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

**Required Variables:**
```
VITE_API_BASE_URL = https://your-backend-url.com
VITE_APP_TITLE = Cortex AI Platform  
VITE_APP_VERSION = 2.0.0
```

**Backend Options:**
- **Local + ngrok**: `https://abc123.ngrok.io`
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`
- **Google Cloud Run**: `https://your-service-run.app`

### 5. Update Backend CORS

Add your Vercel domain to backend CORS settings:

```python
# In cortex/config.py
allowed_origins: List[str] = [
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com",
    "http://localhost:3000",
    "http://localhost:3005"  # New mobile dev port
]
```

## 📱 Mobile-Optimized Features

### PWA (Progressive Web App)
- ✅ App manifest for "Add to Home Screen"
- ✅ Mobile-friendly icons (192x192, 512x512)
- ✅ Standalone display mode
- ✅ Theme colors for mobile browsers

### Responsive Design
- ✅ Touch-friendly interface
- ✅ Mobile navigation
- ✅ Optimized layouts
- ✅ Fast loading

### Performance Optimizations
- ✅ Code splitting (vendor, charts, icons)
- ✅ Asset optimization
- ✅ Caching headers
- ✅ Compressed builds

## 🧪 Testing Your Deployment

### Local Testing
```bash
cd cortex-mobile

# Development server
npm run dev
# Opens on http://localhost:3005

# Production build test
npm run build
npm run preview
# Opens on http://localhost:4173
```

### Mobile Testing
1. **Browser Dev Tools**: Use responsive mode
2. **Real Devices**: Test on actual phones/tablets
3. **Different Browsers**: Safari (iOS), Chrome (Android)
4. **PWA Features**: Test "Add to Home Screen"

### API Connectivity Test
```bash
# From project root, test your API key
python test_my_api_key.py

# Should show:
# ✅ Test 1: Simple Chat
# ✅ Test 2: Code Generation  
# ✅ Test 3: Math Problem
```

## 🔧 Backend Setup Options

### Option 1: Local Backend + ngrok (Quick)
```bash
# Terminal 1: Start backend monitor
python keep-backend-alive.py

# Terminal 2: Expose with ngrok
ngrok http 8000

# Use ngrok URL in Vercel environment variables
```

### Option 2: Railway Deployment (Recommended)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway up

# 3. Add environment variables in Railway dashboard
# 4. Use Railway URL in Vercel
```

### Option 3: Render Deployment (Free Tier)
1. Go to render.com
2. Connect GitHub repository
3. Create new Web Service
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn cortex.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Use Render URL in Vercel

## 🎉 Success Checklist

### Deployment Success
- [ ] `cortex-mobile` folder created with clean structure
- [ ] Dependencies installed successfully
- [ ] Local build works (`npm run build`)
- [ ] Vercel deployment completes without errors
- [ ] Environment variables configured
- [ ] Backend URL accessible

### Mobile Functionality
- [ ] Admin login works with password `ad222333`
- [ ] Dashboard loads on mobile
- [ ] API Playground functional
- [ ] Settings page accessible
- [ ] API key generation works
- [ ] Touch interactions smooth
- [ ] PWA "Add to Home Screen" available

### API Integration
- [ ] Backend health check passes
- [ ] API key authentication works
- [ ] Chat completions functional
- [ ] All V2 routing working (code, math, logic)
- [ ] CORS configured for Vercel domain

## 📞 Quick Commands Reference

```bash
# Setup
cd cortex-mobile
npm install

# Local development
npm run dev          # http://localhost:3005

# Build and test
npm run build
npm run preview      # http://localhost:4173

# Deploy
vercel               # Deploy to Vercel

# Backend
python keep-backend-alive.py    # Start backend monitor
python test_my_api_key.py       # Test API connectivity
```

## 🔗 URLs After Deployment

- **Vercel App**: `https://your-app.vercel.app`
- **Admin Login**: Use password `ad222333`
- **API Playground**: `https://your-app.vercel.app/playground`
- **Mobile PWA**: Add to home screen for app-like experience

## 🎯 Next Steps

1. **Deploy Backend**: Choose Railway, Render, or keep local with ngrok
2. **Deploy Frontend**: Use Vercel CLI from `cortex-mobile/` folder
3. **Configure Environment**: Set `VITE_API_BASE_URL` in Vercel
4. **Test Mobile**: Verify all functionality on mobile devices
5. **Custom Domain**: Optional - add your own domain in Vercel

**🚀 Your fresh Cortex V2 mobile deployment is ready!**