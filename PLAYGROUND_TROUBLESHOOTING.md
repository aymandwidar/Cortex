# Playground Troubleshooting Guide

## Issue: Text Chat Not Working

### Problem
When you type a message and press send, nothing happens or you get an error.

### Root Cause
The Playground needs a **user API key** (not the master key) to make requests to `/v1/chat/completions`.

### Solution (Automatic)
The Playground now automatically creates a test API key for you when you first open it.

**What happens:**
1. Playground opens
2. Shows "Initializing..." message
3. Creates a test API key using your master key
4. Stores the key in browser localStorage
5. Uses this key for all chat requests

### Manual Solution (If Automatic Fails)

#### Step 1: Create an API Key
1. Go to **API Keys** page in the sidebar
2. Click **"Generate New Key"**
3. Fill in:
   - Name: `Playground Test Key`
   - User ID: `playground-user`
4. Click **"Generate"**
5. **Copy the key** (starts with `ctx_`)

#### Step 2: Store the Key
Open browser console (F12) and run:
```javascript
localStorage.setItem('playground_api_key', 'ctx_your-key-here')
location.reload()
```

#### Step 3: Test
1. Refresh the Playground page
2. Type a message
3. Press Send
4. Should work now! ✅

## Common Errors

### Error: "Failed to initialize playground"

**Cause**: Master key is incorrect or backend is not running

**Solutions**:
1. Check you're logged in with correct master key
2. Verify backend is running on port 8080:
   ```bash
   curl http://localhost:8080/health
   ```
3. Check browser console for detailed error
4. Click "Retry" button in the Playground

### Error: "API key not initialized"

**Cause**: API key creation failed

**Solutions**:
1. Refresh the page
2. Clear localStorage and try again:
   ```javascript
   localStorage.removeItem('playground_api_key')
   location.reload()
   ```
3. Manually create an API key (see above)

### Error: "Invalid authentication"

**Cause**: API key is invalid or expired

**Solutions**:
1. Clear the stored key:
   ```javascript
   localStorage.removeItem('playground_api_key')
   location.reload()
   ```
2. Playground will create a new key automatically

### Error: "Failed to send message"

**Cause**: Backend error or API key issue

**Solutions**:
1. Check backend logs for errors
2. Verify API providers are configured in Settings
3. Check network tab in browser DevTools
4. Try a different model

## Verification Steps

### 1. Check Backend is Running
```bash
curl http://localhost:8080/health
# Should return: {"status":"healthy"}
```

### 2. Check API Key Exists
Open browser console (F12):
```javascript
console.log(localStorage.getItem('playground_api_key'))
// Should show: ctx_...
```

### 3. Test API Key Manually
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_your-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "reflex-model",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 4. Check Master Key
```bash
curl -X GET http://localhost:8080/admin/v1/keys \
  -H "Authorization: Bearer dev-master-key-change-in-production"
# Should return list of API keys
```

## Debug Checklist

- [ ] Backend running on port 8080
- [ ] Admin UI running on port 3000
- [ ] Logged in with correct master key
- [ ] Browser console shows no errors
- [ ] API key created successfully
- [ ] API providers configured in Settings
- [ ] Network requests going to correct URLs

## How It Works

### Authentication Flow

1. **Master Key** (for admin operations):
   - Used to login to Admin UI
   - Used to create/manage API keys
   - Used for `/admin/v1/*` endpoints
   - Example: `dev-master-key-change-in-production`

2. **User API Key** (for chat requests):
   - Created via Admin API
   - Starts with `ctx_`
   - Used for `/v1/chat/completions`
   - Example: `ctx_abc123...`

### Playground Initialization

```
1. User opens Playground
   ↓
2. Check localStorage for existing key
   ↓
3. If no key found:
   - Call /admin/v1/generate_key (with master key)
   - Store returned key in localStorage
   ↓
4. Use stored key for all chat requests
```

### Message Flow

```
1. User types message
   ↓
2. Click Send
   ↓
3. POST /v1/chat/completions
   - Authorization: Bearer ctx_...
   - Body: { model, messages, temperature, etc. }
   ↓
4. Backend processes request
   ↓
5. Return AI response
   ↓
6. Display in chat
```

## Advanced Debugging

### Enable Verbose Logging

In browser console:
```javascript
localStorage.setItem('debug', 'playground:*')
location.reload()
```

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Try sending a message
4. Look for:
   - POST `/admin/v1/generate_key` (should be 200 OK)
   - POST `/v1/chat/completions` (should be 200 OK)
5. Check request/response details

### Check Backend Logs

Look for these log entries:
```
# API key creation
{"event": "api_key_created", "name": "Playground Test Key"}

# Chat request
{"event": "request_received", "path": "/v1/chat/completions"}

# Authentication
{"event": "auth_success_user_key", "key_id": 123}
```

## Still Not Working?

### Reset Everything

```javascript
// Clear all playground data
localStorage.removeItem('playground_api_key')
localStorage.removeItem('cortex_master_key')

// Reload
location.reload()

// Login again with correct master key
// Playground will reinitialize
```

### Check API Provider Configuration

1. Go to **Settings** page
2. Verify you have at least one provider configured:
   - Groq (free tier)
   - OpenRouter (free models)
   - Or any other provider
3. Ensure provider is **Active**
4. Test with a simple message

### Contact Support

If nothing works, provide:
1. Browser console errors
2. Backend logs
3. Network tab screenshots
4. Steps to reproduce

## Quick Fixes

### Fix 1: Refresh and Retry
```
1. Refresh page (F5)
2. Wait for "Initializing..." to complete
3. Try sending a message
```

### Fix 2: Clear and Reinitialize
```javascript
localStorage.removeItem('playground_api_key')
location.reload()
```

### Fix 3: Manual API Key
```
1. Go to API Keys page
2. Generate new key
3. Copy key
4. Run in console:
   localStorage.setItem('playground_api_key', 'your-key')
   location.reload()
```

### Fix 4: Check Backend
```bash
# Restart backend
# Stop with Ctrl+C, then:
python -m uvicorn cortex.main:app --reload --port 8080
```

## Summary

**Most common issue**: Playground needs a user API key, not the master key.

**Solution**: The Playground now creates this automatically. If it fails, create one manually in the API Keys page.

**Verification**: Check browser console for `playground_api_key` in localStorage.

**Still stuck?** See the debug checklist above or check backend logs for errors.
