# Troubleshooting: "Failed to add provider" - 401 Unauthorized

## Problem

When trying to add a provider in the Settings page, you get an error: **"Failed to add provider"**

Backend logs show:
```
{"path": "/admin/v1/settings/providers", "token_prefix": "Sino!10", "event": "invalid_token"}
INFO: POST /admin/v1/settings/providers HTTP/1.1 401 Unauthorized
```

## Root Cause

**You are logged into the Admin UI with an incorrect master key.**

The token prefix "Sino!10" indicates you're using a different key than the one configured in the backend.

## Solution

### Quick Fix (Recommended)

1. **Open your browser console** (Press F12)
2. **Run this script**:
   ```javascript
   // Clear the incorrect key
   localStorage.removeItem('cortex_master_key')
   
   // Set the correct key
   localStorage.setItem('cortex_master_key', 'dev-master-key-change-in-production')
   
   // Reload the page
   location.reload()
   ```
3. **Done!** You should now be logged in with the correct key

### Manual Fix

1. **Logout** from the Admin UI (or close the browser)
2. **Clear browser data**:
   - Chrome: Settings → Privacy → Clear browsing data → Cookies and site data
   - Firefox: Settings → Privacy → Clear Data → Cookies
   - Or just use Incognito/Private mode
3. **Open Admin UI** at `http://localhost:3000`
4. **Login with the correct master key**:
   ```
   dev-master-key-change-in-production
   ```
5. **Try adding a provider again**

## Verify You're Using the Correct Key

### Check what key you're currently using:

Open browser console (F12) and run:
```javascript
console.log(localStorage.getItem('cortex_master_key'))
```

**Expected output**: `dev-master-key-change-in-production`

**If you see something else**, that's the problem!

### Check what key the backend expects:

```bash
# Windows Command Prompt
type .env | findstr MASTER_KEY

# PowerShell
Get-Content .env | Select-String MASTER_KEY

# Git Bash / WSL
grep MASTER_KEY .env
```

**Expected output**: `KIRIO_CORTEX_MASTER_KEY=dev-master-key-change-in-production`

## Test the Backend Directly

Verify the backend is working correctly:

```bash
# This should work (returns 200 OK with empty array or list of providers)
curl -X GET http://localhost:8080/admin/v1/settings/providers -H "Authorization: Bearer dev-master-key-change-in-production"

# This should fail (returns 401 Unauthorized)
curl -X GET http://localhost:8080/admin/v1/settings/providers -H "Authorization: Bearer wrong-key"
```

If the first command works, the backend is fine - the issue is just the Admin UI login.

## Step-by-Step: Add a Provider After Fixing

1. **Verify you're logged in with correct key** (see above)
2. **Navigate to Settings page** in the Admin UI
3. **Click "Add Provider"** button
4. **Fill in the form**:
   - **Provider Name**: Select from dropdown (e.g., `groq`)
   - **API Key**: Enter your actual API key (e.g., `gsk_...` for Groq)
   - **Active**: Toggle ON (green)
5. **Click "Add Provider"**
6. **Success!** You should see the provider in the list with the last 4 characters of the key

## Common Mistakes

| Mistake | Solution |
|---------|----------|
| ❌ Typed the key incorrectly | Copy-paste from `.env` file |
| ❌ Extra spaces before/after key | The Login form trims spaces, but double-check |
| ❌ Using an old/different key | Use exactly what's in `.env` |
| ❌ Backend not running | Check process is running on port 8080 |
| ❌ Wrong backend URL | Admin UI should proxy to `http://localhost:8080` |

## Debug Checklist

- [ ] Backend is running on port 8080
- [ ] `.env` file has `KIRIO_CORTEX_MASTER_KEY=dev-master-key-change-in-production`
- [ ] Browser localStorage has the same key
- [ ] No typos in the master key
- [ ] Admin UI is running on port 3000
- [ ] Browser console shows no errors
- [ ] Network tab shows requests going to `/admin/v1/settings/providers`

## Still Not Working?

### Check Backend Logs

Look at the backend output for the token prefix:

```
{"path": "/admin/v1/settings/providers", "token_prefix": "dev-ma...", "event": "invalid_token"}
```

- If `token_prefix` is `"dev-ma..."` → Backend received correct key, but validation failed (rare)
- If `token_prefix` is something else → You're sending the wrong key

### Restart Everything

Sometimes a clean restart helps:

```bash
# 1. Stop backend (Ctrl+C in the terminal)
# 2. Stop Admin UI (Ctrl+C in the terminal)
# 3. Clear browser cache/localStorage
# 4. Start backend
python -m uvicorn cortex.main:app --reload --port 8080

# 5. Start Admin UI (in another terminal)
cd admin-ui
npm run dev

# 6. Open browser in Incognito mode
# 7. Login with correct key
```

### Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to add a provider
4. Look for the POST request to `/admin/v1/settings/providers`
5. Check the request headers:
   - Should have: `Authorization: Bearer dev-master-key-change-in-production`
   - If it has something else, that's the issue

### Verify Auth Middleware

The backend auth middleware logs every authentication attempt. Check for:

```
{"event": "auth_success_master", "path": "/admin/v1/settings/providers"}  ✅ Good
{"event": "invalid_token", "path": "/admin/v1/settings/providers"}        ❌ Wrong key
```

## Success Indicators

When everything is working correctly, you should see:

1. **In browser console**: No errors
2. **In backend logs**: 
   ```
   INFO: POST /admin/v1/settings/providers HTTP/1.1 200 OK
   {"event": "provider_setting_created", "provider": "groq"}
   ```
3. **In Admin UI**: Provider appears in the list with `...XXXX` (last 4 chars of key)

## Need More Help?

If you've tried everything above and it's still not working:

1. **Check the backend logs** for any Python errors
2. **Check browser console** for JavaScript errors
3. **Verify the database** exists: `cortex.db` should be in the project root
4. **Check file permissions** on `.encryption_key` file
5. **Try the curl command** to isolate if it's a backend or frontend issue

## Related Files

- `LOGIN_INSTRUCTIONS.md` - Detailed login instructions
- `SETTINGS_GUIDE.md` - How to use the Settings page
- `SETTINGS_FIX_COMPLETE.md` - Technical details of the fixes
- `.env` - Configuration file with master key
