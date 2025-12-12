# Admin UI Login Instructions

## The Issue

You're getting "Failed to add provider" because you're logged into the Admin UI with an incorrect master key.

The backend logs show:
```
{"path": "/admin/v1/settings/providers", "token_prefix": "Sino!10", "event": "invalid_token"}
INFO: POST /admin/v1/settings/providers HTTP/1.1 401 Unauthorized
```

This means the Admin UI is sending a token that starts with "Sino!10..." but the backend expects: `dev-master-key-change-in-production`

## How to Fix

### Step 1: Logout from Admin UI
1. Open the Admin UI at `http://localhost:3000`
2. Click the "Logout" button (if available) or clear your browser's localStorage
3. Or simply close the browser and reopen

### Step 2: Clear Browser Storage (if needed)
Open browser console (F12) and run:
```javascript
localStorage.removeItem('cortex_master_key')
location.reload()
```

### Step 3: Login with Correct Master Key
1. You should see the login page
2. Enter the master key exactly as shown below:
   ```
   dev-master-key-change-in-production
   ```
3. Click "Login"

### Step 4: Test Settings Page
1. Navigate to "Settings" in the sidebar
2. Click "Add Provider"
3. Fill in the form:
   - Provider Name: `groq`
   - API Key: Your actual Groq API key
   - Active: Toggle ON
4. Click "Add Provider"
5. It should now work! ✅

## Verify Master Key

You can verify the correct master key by checking the `.env` file:

```bash
# Windows Command Prompt
type .env | findstr MASTER_KEY

# PowerShell
Get-Content .env | Select-String MASTER_KEY
```

Expected output:
```
KIRIO_CORTEX_MASTER_KEY=dev-master-key-change-in-production
```

## Test Backend Directly

You can test that the backend is working correctly:

```bash
# Test with correct master key (should return empty array or list of providers)
curl -X GET http://localhost:8080/admin/v1/settings/providers -H "Authorization: Bearer dev-master-key-change-in-production"

# Test with wrong key (should return 401 error)
curl -X GET http://localhost:8080/admin/v1/settings/providers -H "Authorization: Bearer wrong-key"
```

## Common Mistakes

❌ **Wrong**: Using a different key than what's in `.env`
❌ **Wrong**: Typing the key incorrectly (extra spaces, typos)
❌ **Wrong**: Using an old key from a previous session

✅ **Correct**: Using exactly `dev-master-key-change-in-production`
✅ **Correct**: Copy-pasting from `.env` file to avoid typos
✅ **Correct**: Logging out and back in if you changed the key

## Security Note

The master key `dev-master-key-change-in-production` is only for development. 

**Before deploying to production:**
1. Generate a strong, random master key
2. Update `KIRIO_CORTEX_MASTER_KEY` in your production `.env`
3. Store it securely (use Google Secret Manager, AWS Secrets Manager, etc.)
4. Never commit the production key to git

## Still Having Issues?

If you're still getting 401 errors after following these steps:

1. **Check backend logs**:
   - Look for the `token_prefix` in the logs
   - It should show `dev-ma...` (first 12 chars of the correct key)
   - If it shows something else, you're using the wrong key

2. **Restart backend**:
   ```bash
   # Stop the backend process
   # Then restart it
   python -m uvicorn cortex.main:app --reload --port 8080
   ```

3. **Check browser console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any error messages
   - Check Network tab for the actual request being sent

4. **Verify localStorage**:
   ```javascript
   // In browser console
   console.log(localStorage.getItem('cortex_master_key'))
   // Should output: dev-master-key-change-in-production
   ```

## Quick Fix Script

Run this in your browser console to force the correct key:

```javascript
// Clear old key
localStorage.removeItem('cortex_master_key')

// Set correct key
localStorage.setItem('cortex_master_key', 'dev-master-key-change-in-production')

// Reload page
location.reload()
```

After running this script, you should be logged in with the correct key and the Settings page should work! 🎉
