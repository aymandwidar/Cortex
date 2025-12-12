# Quick Fix: "Failed to add provider" Error

## The Problem
You're logged into the Admin UI with the **wrong master key**.

## The Solution (30 seconds)

### Option 1: Browser Console (Fastest)
1. Press **F12** to open browser console
2. Paste this code and press Enter:
```javascript
localStorage.setItem('cortex_master_key', 'dev-master-key-change-in-production')
location.reload()
```
3. Done! Try adding a provider again.

### Option 2: Logout and Login
1. Logout from Admin UI (or close browser)
2. Open `http://localhost:3000`
3. Login with this exact key:
```
dev-master-key-change-in-production
```
4. Done! Try adding a provider again.

## How to Add a Provider

1. Go to **Settings** page
2. Click **"Add Provider"**
3. Fill in:
   - **Provider**: Select `groq` (or any provider)
   - **API Key**: Your actual API key
   - **Active**: Toggle ON
4. Click **"Add Provider"**
5. Success! ✅

## Verify It's Working

Run this in your terminal:
```bash
curl -X GET http://localhost:8080/admin/v1/settings/providers -H "Authorization: Bearer dev-master-key-change-in-production"
```

Should return: `[]` (empty array) or a list of providers

## Need More Help?

See these detailed guides:
- `TROUBLESHOOTING_401_ERROR.md` - Complete troubleshooting guide
- `LOGIN_INSTRUCTIONS.md` - Detailed login instructions
- `SETTINGS_GUIDE.md` - How to use Settings page
