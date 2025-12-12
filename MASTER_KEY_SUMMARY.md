# Master Key Management - Complete Summary

## What You Asked

> "how can i change the master key at the end of the project"

## Answer

You can change the master key anytime by following these steps:

### For Development (Local)

**Quick Method:**
```bash
# 1. Generate new key
python generate-master-key.py --update

# 2. Restart backend
# (Stop with Ctrl+C, then start again)
python -m uvicorn cortex.main:app --reload --port 8080

# 3. Login to Admin UI with new key
```

**Manual Method:**
```bash
# 1. Generate key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Edit .env file
KIRIO_CORTEX_MASTER_KEY=your-new-key-here

# 3. Restart backend
# 4. Login to Admin UI with new key
```

### For Production (Google Cloud)

**Using Secret Manager (Recommended):**
```bash
# 1. Generate key
NEW_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# 2. Store in Secret Manager
echo -n "$NEW_KEY" | gcloud secrets versions add cortex-master-key --data-file=-

# 3. Restart Cloud Run (automatic)
gcloud run services update cortex-ai-router --region=us-central1

# 4. Notify admin users of new key
```

## Files Created for You

I've created comprehensive documentation to help you manage the master key:

### Main Guides
1. **`CHANGE_MASTER_KEY.md`** ⭐ - Complete guide with all methods
2. **`MASTER_KEY_QUICK_REFERENCE.md`** - Quick reference card
3. **`MASTER_KEY_SUMMARY.md`** - This file

### Helper Scripts
4. **`generate-master-key.py`** - Python script to generate and update key
5. **`generate-master-key.bat`** - Windows batch script

### Related Documentation
6. **`DEPLOYMENT_CHECKLIST.md`** - Updated with master key steps
7. **`README.md`** - Updated with documentation links

### Troubleshooting Guides
8. **`LOGIN_INSTRUCTIONS.md`** - How to login with correct key
9. **`TROUBLESHOOTING_401_ERROR.md`** - Fix authentication errors
10. **`QUICK_FIX.md`** - 30-second fix for login issues

## Quick Commands

### Generate New Key
```bash
# Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Using script
python generate-master-key.py

# Windows
generate-master-key.bat
```

### Update .env File
```bash
# Automatic
python generate-master-key.py --update

# Manual
# Edit .env and change:
KIRIO_CORTEX_MASTER_KEY=your-new-key-here
```

### Test New Key
```bash
curl -X GET http://localhost:8080/admin/v1/keys \
  -H "Authorization: Bearer your-new-key-here"
```

## When to Change the Master Key

### Required Changes:
- ✅ **Before production deployment** - Never use the default key in production
- ✅ **After security incident** - If key is compromised
- ✅ **Regular rotation** - Every 90 days (recommended)

### Optional Changes:
- When team members change
- When moving between environments (dev → staging → prod)
- When you want to revoke all admin access

## Security Best Practices

### ✅ DO:
- Use strong random keys (32+ characters)
- Store in Secret Manager for production
- Use different keys for dev/staging/prod
- Rotate every 90 days
- Keep keys out of git

### ❌ DON'T:
- Never use `dev-master-key-change-in-production` in production
- Never commit keys to git
- Never share keys in plain text
- Never reuse keys across environments

## Current Status

### Development Key (Default)
```
dev-master-key-change-in-production
```
- ⚠️ This is in `.env` file
- ⚠️ Only for local development
- ⚠️ Must change before production

### Your Current Issue (Resolved)
You were getting "Failed to add provider" because you logged into the Admin UI with a different key than what's in `.env`.

**Solution**: Login with `dev-master-key-change-in-production` or use the Quick Fix:
```javascript
localStorage.setItem('cortex_master_key', 'dev-master-key-change-in-production')
location.reload()
```

## Production Deployment Checklist

When you're ready to deploy:

- [ ] Generate strong master key: `python generate-master-key.py`
- [ ] Store in Google Secret Manager
- [ ] Update `cloud-run.yaml` or environment variables
- [ ] Test authentication with new key
- [ ] Document key location for team
- [ ] Set up 90-day rotation reminder
- [ ] Remove default key from all configs
- [ ] Verify `.gitignore` includes `.env`

## Example: Complete Key Change

```bash
# 1. Generate new key
python generate-master-key.py --update

# Output:
# ======================================================================
# 🔑 Cortex Master Key Generator
# ======================================================================
# 
# Generated Master Key:
#   xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF4gH2jK9mN7bV5cX8zW
# 
# ✅ .env file updated successfully!

# 2. Restart backend
# Stop with Ctrl+C, then:
python -m uvicorn cortex.main:app --reload --port 8080

# 3. Open Admin UI
# http://localhost:3000

# 4. Login with new key
# xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF4gH2jK9mN7bV5cX8zW

# 5. Test Settings page
# Add a provider - should work! ✅
```

## For Production (Google Cloud)

```bash
# 1. Generate key
NEW_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "New key: $NEW_KEY"

# 2. Create secret
gcloud secrets create cortex-master-key \
  --data-file=- <<< "$NEW_KEY" \
  --project=YOUR_PROJECT_ID

# 3. Grant access
gcloud secrets add-iam-policy-binding cortex-master-key \
  --member="serviceAccount:YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 4. Update Cloud Run
gcloud run services update cortex-ai-router \
  --update-secrets=KIRIO_CORTEX_MASTER_KEY=cortex-master-key:latest \
  --region=us-central1

# 5. Test
curl -X GET https://your-domain.com/admin/v1/keys \
  -H "Authorization: Bearer $NEW_KEY"
```

## Key Rotation Script

For automated rotation, use the script in `CHANGE_MASTER_KEY.md`:

```bash
#!/bin/bash
# rotate-master-key.sh
# Automatically rotates the master key in production

./rotate-master-key.sh
```

## Need Help?

### Documentation
- **Complete Guide**: `CHANGE_MASTER_KEY.md`
- **Quick Reference**: `MASTER_KEY_QUICK_REFERENCE.md`
- **Troubleshooting**: `TROUBLESHOOTING_401_ERROR.md`

### Scripts
- **Generate Key**: `python generate-master-key.py`
- **Windows**: `generate-master-key.bat`

### Support
- Check backend logs for authentication errors
- Use browser console to verify localStorage key
- Test with curl to isolate frontend/backend issues

## Summary

**To change the master key:**

1. **Generate**: `python generate-master-key.py --update`
2. **Restart**: Backend server
3. **Login**: Admin UI with new key
4. **Production**: Use Google Secret Manager

**For production deployment:**
- Never use the default key
- Store in Secret Manager
- Rotate every 90 days
- Keep out of git

You're all set! 🎉
