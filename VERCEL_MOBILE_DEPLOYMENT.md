# 📱 Vercel Mobile Deployment Guide

## 🎯 Overview
Deploy Cortex V2 Admin UI to Vercel for mobile access while keeping the backend running locally or on a cloud server.

## 🚀 Quick Deployment Steps

### 1. Prepare for Deployment
```bash
# Build the frontend locally to test
cd admin-ui
npm run build

# Test the build
npm run preview
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: cortex-v2
# - Directory: ./admin-ui
# - Override settings? No
```

#### Option B: GitHub Integration
1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect Vercel**: Go to https://vercel.com/dashboard
3. **Import Project**: Click "New Project" → Import from GitHub
4. **Configure**:
   - Root Directory: `admin-ui`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```
VITE_API_BASE_URL = https://your-backend-domain.com
VITE_APP_TITLE = Cortex AI Platform
VITE_APP_VERSION = 2.0.0
```

### 4. Backend Deployment Options

#### Option A: Local Backend (Development)
- Keep backend running on your local machine
- Use ngrok for public access:
```bash
# Install ngrok
# Download from https://ngrok.com/

# Expose local backend
ngrok http 8000

# Use the ngrok URL in VITE_API_BASE_URL
# Example: https://abc123.ngrok.io
```

#### Option B: Cloud Backend (Production)
Deploy backend to:
- **Railway**: Easy Python deployment
- **Render**: Free tier available  
- **Google Cloud Run**: Serverless option
- **AWS Lambda**: Serverless with API Gateway
- **DigitalOcean App Platform**: Simple deployment

## 📱 Mobile Optimization Features

### Responsive Design
- ✅ Touch-friendly interface
- ✅ Mobile-optimized layouts
- ✅ Swipe gestures support
- ✅ Responsive navigation

### Progressive Web App (PWA)
Add PWA manifest for app-like experience:

```json
// admin-ui/public/manifest.json
{
  "name": "Cortex AI Platform",
  "short_name": "Cortex",
  "description": "AI-powered platform with intelligent routing",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Mobile Testing
Test on different devices:
- **iOS Safari**: iPhone/iPad
- **Android Chrome**: Various Android devices
- **Responsive Mode**: Browser dev tools
- **Real Devices**: Physical testing recommended

## 🔧 Backend Reliability Setup

### Health Monitoring Script
Use the provided `keep-backend-alive.py`:

```bash
# Start backend with health monitoring
python keep-backend-alive.py
```

Features:
- ✅ Automatic health checks every 30 seconds
- ✅ Auto-restart on failures
- ✅ Process management
- ✅ Logging and monitoring
- ✅ Graceful shutdown handling

### Production Startup
Use `start-production.bat` for Windows:

```bash
# Start complete production environment
start-production.bat
```

This will:
1. Start backend health monitor
2. Launch frontend development server
3. Run system health tests
4. Display access URLs and credentials

### Systemd Service (Linux)
For Linux servers, create a systemd service:

```ini
# /etc/systemd/system/cortex-backend.service
[Unit]
Description=Cortex V2 Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/cortex
ExecStart=/usr/bin/python3 keep-backend-alive.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable cortex-backend
sudo systemctl start cortex-backend
sudo systemctl status cortex-backend
```

## 🌐 Domain Configuration

### Custom Domain (Optional)
1. **Add Domain**: In Vercel Dashboard → Domains
2. **Configure DNS**: Point your domain to Vercel
3. **SSL Certificate**: Automatic HTTPS
4. **Update Environment**: Use your domain in API calls

### CORS Configuration
Update backend CORS settings for your domain:

```python
# In cortex/config.py
allowed_origins: List[str] = [
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com",
    "http://localhost:3000",  # Development
    "http://localhost:3004"   # Development
]
```

## 🔐 Security Considerations

### API Key Security
- ✅ Never expose API keys in frontend code
- ✅ Use environment variables
- ✅ Implement proper CORS
- ✅ Use HTTPS in production

### Authentication Flow
1. **Admin Login**: Use master key `ad222333`
2. **API Key Generation**: Create application keys
3. **Mobile Access**: Use generated API keys
4. **Session Management**: JWT tokens for sessions

## 📊 Monitoring & Analytics

### Vercel Analytics
Enable in Vercel Dashboard:
- **Web Analytics**: Page views, performance
- **Speed Insights**: Core Web Vitals
- **Function Logs**: API call monitoring

### Backend Monitoring
- **Health Endpoint**: `/health` for uptime monitoring
- **Metrics Endpoint**: `/metrics` for Prometheus
- **Log Aggregation**: Structured logging
- **Error Tracking**: Exception monitoring

## 🧪 Testing Mobile Deployment

### Pre-deployment Testing
```bash
# Test build locally
cd admin-ui
npm run build
npm run preview

# Test API connectivity
python test_my_api_key.py

# Test mobile responsiveness
# Open http://localhost:4173 in mobile browser
```

### Post-deployment Testing
1. **Access Vercel URL**: Test basic functionality
2. **Mobile Browsers**: Test on actual devices
3. **API Connectivity**: Verify backend communication
4. **Authentication**: Test login flow
5. **Core Features**: Test all major functions

### Test Checklist
- [ ] Admin login works with new password `ad222333`
- [ ] API key generation functional
- [ ] Chat playground responsive on mobile
- [ ] Settings page accessible
- [ ] Analytics dashboard loads
- [ ] API endpoints respond correctly
- [ ] Mobile navigation works
- [ ] Touch interactions smooth
- [ ] Loading states appropriate
- [ ] Error handling graceful

## 🎉 Success Metrics

### Deployment Success
- ✅ Vercel build completes without errors
- ✅ Frontend loads on mobile devices
- ✅ Backend connectivity established
- ✅ Authentication flow working
- ✅ All core features functional

### Performance Targets
- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 3 seconds
- **Time to Interactive**: < 4 seconds
- **Cumulative Layout Shift**: < 0.1

## 🔮 Next Steps

### Enhanced Mobile Features
- **Push Notifications**: Real-time updates
- **Offline Support**: Service worker caching
- **Voice Input**: Speech-to-text integration
- **Camera Integration**: Image upload from mobile
- **Biometric Auth**: Fingerprint/Face ID

### Scaling Considerations
- **CDN Integration**: Global content delivery
- **Database Optimization**: Connection pooling
- **Caching Strategy**: Redis implementation
- **Load Balancing**: Multiple backend instances
- **Auto-scaling**: Dynamic resource allocation

---

## 📞 Quick Reference

**Vercel App URL**: `https://your-app.vercel.app`
**Admin Password**: `ad222333`
**Backend Health**: `http://localhost:8000/health`
**API Testing**: `python test_my_api_key.py`

**🚀 Your Cortex V2 is now mobile-ready and production-deployed!**