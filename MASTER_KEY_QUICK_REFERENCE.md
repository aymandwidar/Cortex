# Master Key Quick Reference

## What is the Master Key?

The master key is the **admin password** for your Cortex AI Router. It's used to:
- Login to the Admin UI
- Access admin API endpoints
- Manage API keys
- Configure provider settings
- View analytics and metrics

## Current Master Key (Development)

```
dev-master-key-change-in-production
```

⚠️ **This is only for development! Change it before deploying to production.**

## How to Change It

### Quick Method (3 steps):

1. **Generate a new key:**
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Update `.env` file:**
   ```bash
   KIRIO_CORTEX_MASTER_KEY=your-new-key-here
   ```

3. **Restart backend:**
   ```bash
   # Stop backend (Ctrl+C)
   python -m uvicorn cortex.main:app --reload --port 8080
   ```

### For Production:

See `CHANGE_MASTER_KEY.md` for complete instructions on using Google Secret Manager.

## Where is it Used?

### Backend (cortex/config.py)
```python
class Settings(BaseSettings):
    kirio_cortex_master_key: str = "dev-master-key-change-in-production"
```

### Environment (.env)
```bash
KIRIO_CORTEX_MASTER_KEY=dev-master-key-change-in-production
```

### Admin UI (localStorage)
```javascript
localStorage.getItem('cortex_master_key')
```

### API Requests (Authorization header)
```bash
Authorization: Bearer dev-master-key-change-in-production
```

## Common Commands

### Test if master key works:
```bash
curl -X GET http://localhost:8080/admin/v1/keys \
  -H "Authorization: Bearer dev-master-key-change-in-production"
```

### Check current key in .env:
```bash
# Windows Command Prompt
type .env | findstr MASTER_KEY

# PowerShell
Get-Content .env | Select-String MASTER_KEY

# Git Bash / WSL
grep MASTER_KEY .env
```

### Generate new key:
```bash
# Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -base64 32

# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Update key in browser:
```javascript
// Open browser console (F12)
localStorage.setItem('cortex_master_key', 'your-new-key-here')
location.reload()
```

## Security Checklist

### Development:
- [x] Use default key for local testing
- [ ] Don't share your local .env file
- [ ] Keep .env in .gitignore

### Production:
- [ ] Generate strong random key (32+ characters)
- [ ] Store in Google Secret Manager (not .env)
- [ ] Never commit production key to git
- [ ] Use different keys for dev/staging/prod
- [ ] Rotate every 90 days
- [ ] Monitor for unauthorized access attempts

## Troubleshooting

### "Invalid authentication" error
→ Check you're using the correct master key
→ See `TROUBLESHOOTING_401_ERROR.md`

### "Failed to add provider"
→ Logout and login with correct key
→ See `QUICK_FIX.md`

### Backend not accepting key
→ Restart backend after changing .env
→ Check for typos in the key

### Admin UI not working
→ Clear browser localStorage
→ Login again with correct key

## Key Rotation Schedule

| Environment | Rotation Frequency | Storage |
|-------------|-------------------|---------|
| Development | Never (use default) | .env file |
| Staging | Every 90 days | Secret Manager |
| Production | Every 90 days | Secret Manager |

## Related Documentation

- `CHANGE_MASTER_KEY.md` - Complete guide to changing the master key
- `QUICK_FIX.md` - Fix login issues
- `TROUBLESHOOTING_401_ERROR.md` - Fix authentication errors
- `LOGIN_INSTRUCTIONS.md` - How to login to Admin UI
- `DEPLOYMENT_CHECKLIST.md` - Production deployment steps

## Emergency Contacts

If you lose the production master key:
1. Generate a new key
2. Update Secret Manager
3. Redeploy Cloud Run service
4. Notify all admin users

**Note**: Losing the master key doesn't affect user API keys or encrypted provider settings.

## Summary

**Development**: Use `dev-master-key-change-in-production`

**Production**: 
1. Generate: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
2. Store: Google Secret Manager
3. Deploy: Update Cloud Run environment
4. Rotate: Every 90 days

Keep it secure! 🔒
