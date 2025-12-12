# 🔑 API Key Generation & Usage Guide

## ✅ System Status
- **Backend**: Running on http://localhost:8000 ✅
- **Frontend**: Running on http://localhost:3004 ✅  
- **API Key Testing**: All tests passing ✅

## 🎯 Quick Access URLs
- **Admin Dashboard**: http://localhost:3004/
- **API Playground**: http://localhost:3004/playground
- **Settings Page**: http://localhost:3004/settings
- **API Keys Page**: http://localhost:3004/api-keys

## 🔐 Admin Login
- **Master Key**: `dev-master-key-change-in-production`
- Use this key to access the admin dashboard

## 📋 Step-by-Step API Key Generation

### Method 1: Using the Admin UI (Recommended)
1. **Open Admin Dashboard**: http://localhost:3004/
2. **Login**: Enter master key `dev-master-key-change-in-production`
3. **Navigate to API Keys**: Click "API Keys" in the sidebar
4. **Create New Key**: 
   - Click "Generate New Key"
   - Enter a name (e.g., "My App Key")
   - Click "Create"
5. **Copy Your Key**: Save the generated key (starts with `ctx_`)

### Method 2: Using Python Script
```bash
python create_app_key.py
```

## 🧪 Testing Your API Key

### Current Working API Key
```
ctx_383b017dd3de08616a5967088a7320dcac1a263b9cde3142465cdd9257ab1e18
```

### Test Script
Run the test script to verify your key works:
```bash
python test_my_api_key.py
```

### Expected Results
- ✅ Test 1: Simple Chat (llama-3.1-8b-instant)
- ✅ Test 2: Code Generation (llama-3.3-70b-versatile) 
- ✅ Test 3: Math Problem (llama-3.3-70b-versatile)

## 🚀 Using Your API Key in Applications

### Python Example
```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "http://localhost:8000"

response = requests.post(
    f"{BASE_URL}/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "auto",  # V2 Agentic routing
        "messages": [
            {"role": "user", "content": "Hello!"}
        ]
    }
)

print(response.json())
```

### cURL Example
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## 🎮 V2 Agentic System Features

### Intelligent Routing
- **Simple Chat**: Routes to `llama-3.1-8b-instant`
- **Code Generation**: Routes to `llama-3.3-70b-versatile` 
- **Math Problems**: Routes to `llama-3.3-70b-versatile`
- **Logic Puzzles**: Routes to `deepseek/deepseek-r1`
- **Image Analysis**: Routes to vision models

### Available Models
- `auto` - Intelligent routing (recommended)
- `llama-3.1-8b-instant` - Fast general chat
- `llama-3.3-70b-versatile` - Advanced reasoning
- `deepseek/deepseek-r1` - Logic and puzzles
- `gemini-1.5-flash` - Vision and multimodal

## 🔧 Troubleshooting

### API Key Not Working?
1. **Check Backend**: Ensure http://localhost:8000/health returns `{"status":"healthy"}`
2. **Verify Key Format**: Should start with `ctx_`
3. **Test Connection**: Run `python test_my_api_key.py`
4. **Check Logs**: Look at backend terminal for error messages

### Connection Issues?
1. **Backend Port**: Make sure port 8000 is not blocked
2. **Frontend Port**: Access UI on http://localhost:3004/
3. **Firewall**: Check Windows firewall settings
4. **Restart Services**: Stop and restart backend/frontend if needed

### Generate New Key?
If your current key stops working:
1. Go to http://localhost:3004/api-keys
2. Delete old key
3. Generate new key
4. Update your applications

## 📊 API Key Management

### In the Admin UI
- **View All Keys**: See all generated API keys
- **Key Usage**: Monitor API call statistics  
- **Revoke Keys**: Delete compromised keys
- **Key Names**: Organize keys by application

### Key Security
- **Never share** your API keys publicly
- **Rotate keys** regularly for production
- **Use different keys** for different applications
- **Monitor usage** for suspicious activity

## 🎉 Success!

Your Cortex V2 Agentic System is fully operational with:
- ✅ Working API key authentication
- ✅ Intelligent model routing
- ✅ All free AI models configured
- ✅ Admin dashboard accessible
- ✅ API playground ready

**Your working API key**: `ctx_383b017dd3de08616a5967088a7320dcac1a263b9cde3142465cdd9257ab1e18`

Start building amazing AI applications! 🚀