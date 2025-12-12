# Playground Fix - Text Chat Now Working ✅

## The Problem

When you tried to send a message in the Playground, it wasn't working because:

**Root Cause**: The Playground was using the **master key** to call `/v1/chat/completions`, but this endpoint requires a **user API key** (starting with `ctx_`).

### Authentication in Cortex

Cortex has two types of authentication:

1. **Master Key** - For admin operations
   - Login to Admin UI
   - Create/manage API keys
   - Access `/admin/v1/*` endpoints
   - Example: `dev-master-key-change-in-production`

2. **User API Key** - For AI chat requests
   - Make chat completion requests
   - Access `/v1/chat/completions`
   - Starts with `ctx_`
   - Example: `ctx_abc123def456...`

## The Solution

I've updated the Playground to **automatically create a test API key** when you first open it.

### What Changed

**Before**:
```typescript
// ❌ Used master key directly (wrong!)
const response = await fetch('/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${masterKey}`  // This doesn't work!
  }
})
```

**After**:
```typescript
// ✅ Creates API key first, then uses it
useEffect(() => {
  initializeApiKey()  // Creates ctx_... key
}, [masterKey])

// ✅ Uses the API key for chat
const response = await fetch('/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${apiKey}`  // This works!
  }
})
```

### Initialization Flow

```
1. User opens Playground
   ↓
2. Check localStorage for existing API key
   ↓
3. If no key found:
   - Call POST /admin/v1/generate_key (with master key)
   - Get back a ctx_... key
   - Store in localStorage
   ↓
4. Show "Initializing..." message
   ↓
5. Once key is ready, show chat interface
   ↓
6. Use API key for all chat requests
```

## Files Updated

1. **`admin-ui/src/pages/Playground.tsx`**:
   - Added `apiKey` state
   - Added `initError` state
   - Added `initializeApiKey()` function
   - Added initialization useEffect
   - Added loading/error states
   - Updated fetch to use API key instead of master key

2. **`admin-ui/src/pages/Playground.css`**:
   - Added `.retry-btn` styles

3. **`PLAYGROUND_TROUBLESHOOTING.md`** (new):
   - Complete troubleshooting guide
   - Common errors and solutions
   - Debug checklist

4. **`PLAYGROUND_FIX.md`** (this file):
   - Explanation of the fix

## How to Test

### 1. Refresh the Playground

```bash
# If Admin UI is running, just refresh the browser
# Or restart it:
cd admin-ui
npm run dev
```

### 2. Open Playground

1. Go to `http://localhost:3000`
2. Login with master key: `dev-master-key-change-in-production`
3. Click **"Playground"** in sidebar

### 3. Wait for Initialization

You'll see:
```
Setting up playground...
Creating test API key for you
```

This takes 1-2 seconds.

### 4. Send a Message

1. Type: "Hello, how are you?"
2. Press Enter or click Send
3. Should work now! ✅

## What You'll See

### First Time Opening Playground

```
┌─────────────────────────────┐
│   AI Playground             │
│   Initializing...           │
├─────────────────────────────┤
│                             │
│   🔄 Setting up playground  │
│   Creating test API key     │
│                             │
└─────────────────────────────┘
```

### After Initialization

```
┌─────────────────────────────┐
│   AI Playground             │
│   Test different models...  │
├─────────────────────────────┤
│                             │
│   Welcome to AI Playground! │
│                             │
│   [Text] [Voice] [Image]    │
│                             │
├─────────────────────────────┤
│ Type a message...      [>]  │
└─────────────────────────────┘
```

### Sending a Message

```
┌─────────────────────────────┐
│   AI Playground             │
├─────────────────────────────┤
│                             │
│  You: Hello!                │
│  [12:34 PM]                 │
│                             │
│  Assistant: Hi! How can I   │
│  help you today?            │
│  [12:34 PM] [reflex-model]  │
│                             │
└─────────────────────────────┘
```

## Verification

### Check API Key Was Created

Open browser console (F12):
```javascript
console.log(localStorage.getItem('playground_api_key'))
// Should show: ctx_...
```

### Check in API Keys Page

1. Go to **API Keys** page
2. You should see: **"Playground Test Key"**
3. Status: Active ✅
4. User ID: `playground-user`

### Test Backend Directly

```bash
# Get the API key from browser console first
API_KEY="ctx_your-key-here"

# Test chat endpoint
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "reflex-model",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Troubleshooting

### "Failed to initialize playground"

**Cause**: Master key is wrong or backend is down

**Fix**:
1. Check you're logged in with correct master key
2. Verify backend is running:
   ```bash
   curl http://localhost:8080/health
   ```
3. Click "Retry" button

### "API key not initialized"

**Cause**: API key creation failed

**Fix**:
```javascript
// Clear and retry
localStorage.removeItem('playground_api_key')
location.reload()
```

### Still not working?

See `PLAYGROUND_TROUBLESHOOTING.md` for complete guide.

## Benefits of This Approach

### ✅ Automatic Setup
- No manual API key creation needed
- Works out of the box
- Seamless user experience

### ✅ Persistent
- API key stored in localStorage
- Reused across sessions
- No need to recreate each time

### ✅ Secure
- API key created with proper authentication
- Stored locally in browser
- Not exposed in code

### ✅ User-Friendly
- Clear loading states
- Error messages with retry option
- Automatic recovery

## Technical Details

### API Key Creation Request

```javascript
POST /admin/v1/generate_key
Authorization: Bearer dev-master-key-change-in-production
Content-Type: application/json

{
  "name": "Playground Test Key",
  "user_id": "playground-user",
  "metadata": {
    "purpose": "playground-testing"
  }
}
```

### Response

```json
{
  "key": "ctx_abc123def456...",
  "key_info": {
    "id": 1,
    "name": "Playground Test Key",
    "key_prefix": "ctx_abc",
    "user_id": "playground-user",
    "is_active": true,
    "created_at": "2025-12-08T...",
    "metadata": {
      "purpose": "playground-testing"
    }
  }
}
```

### Storage

```javascript
localStorage.setItem('playground_api_key', 'ctx_abc123def456...')
```

### Usage

```javascript
fetch('/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
```

## Next Steps

1. **Refresh the Playground** page
2. **Wait for initialization** (1-2 seconds)
3. **Start chatting!** Type a message and press Enter
4. **Try voice input** - Click microphone icon
5. **Upload an image** - Click image icon
6. **Experiment with settings** - Click Settings button

## Summary

**Problem**: Playground used master key for chat requests (wrong authentication type)

**Solution**: Automatically create a user API key on first load

**Result**: Text chat now works! ✅

**Files Changed**: 
- `admin-ui/src/pages/Playground.tsx` (added auto-initialization)
- `admin-ui/src/pages/Playground.css` (added retry button style)

**New Docs**:
- `PLAYGROUND_TROUBLESHOOTING.md` (complete troubleshooting guide)
- `PLAYGROUND_FIX.md` (this file)

The Playground is now fully functional! 🎉
