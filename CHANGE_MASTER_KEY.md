# How to Change the Master Key for Production

## Overview

The master key is used to authenticate admin access to the Cortex API and Admin UI. For production, you **must** change it from the development default.

## Quick Steps

### 1. Generate a Strong Master Key

Use one of these methods to generate a secure random key:

**Python:**
```python
import secrets
print(secrets.token_urlsafe(32))
# Example output: xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF4gH2jK9mN7bV5cX8zW
```

**OpenSSL:**
```bash
openssl rand -base64 32
# Example output: 7Xk9mP2vL8nQ4wR7tY5uI3oP6aS1dF4gH2jK9mN7bV5cX8zW==
```

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
# Example output: aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3
```

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('base64')
// Example output: 7Xk9mP2vL8nQ4wR7tY5uI3oP6aS1dF4gH2jK9mN7bV5cX8zW==
```

### 2. Update Configuration

#### For Local/Development:

Edit `.env` file:
```bash
# Change this line:
KIRIO_CORTEX_MASTER_KEY=dev-master-key-change-in-production

# To your new key:
KIRIO_CORTEX_MASTER_KEY=xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF4gH2jK9mN7bV5cX8zW
```

#### For Production (Google Cloud Run):

Use Google Secret Manager (recommended):

```bash
# 1. Create the secret
gcloud secrets create cortex-master-key \
  --data-file=- <<< "your-secure-master-key-here" \
  --project=YOUR_PROJECT_ID

# 2. Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding cortex-master-key \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=YOUR_PROJECT_ID

# 3. Update cloud-run.yaml to use the secret
```

Update `cloud-run.yaml`:
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: cortex-ai-router
spec:
  template:
    spec:
      containers:
      - image: gcr.io/YOUR_PROJECT/cortex:latest
        env:
        - name: KIRIO_CORTEX_MASTER_KEY
          valueFrom:
            secretKeyRef:
              name: cortex-master-key
              key: latest
```

Or use environment variables in Cloud Run console:
```bash
gcloud run services update cortex-ai-router \
  --update-env-vars KIRIO_CORTEX_MASTER_KEY="your-secure-master-key-here" \
  --project=YOUR_PROJECT_ID \
  --region=us-central1
```

### 3. Restart the Application

**Local Development:**
```bash
# Stop the backend (Ctrl+C)
# Start it again
python -m uvicorn cortex.main:app --reload --port 8080
```

**Production (Cloud Run):**
```bash
# Deploy with new configuration
gcloud run services replace cloud-run.yaml --region=us-central1

# Or if using environment variables, it auto-restarts
```

### 4. Update Admin UI Login

After changing the master key:
1. Logout from Admin UI
2. Login with the new master key
3. All admin operations will now use the new key

## Security Best Practices

### ✅ DO:
- **Use a strong, random key** (at least 32 characters)
- **Store in Secret Manager** for production (Google Secret Manager, AWS Secrets Manager, Azure Key Vault)
- **Rotate regularly** (every 90 days recommended)
- **Use different keys** for dev, staging, and production
- **Restrict access** to the secret (only service accounts that need it)
- **Log all admin operations** (already implemented in Cortex)
- **Use HTTPS** in production (Cloud Run provides this automatically)

### ❌ DON'T:
- **Never commit** the production key to git
- **Never share** the key in plain text (email, Slack, etc.)
- **Never use** the default `dev-master-key-change-in-production` in production
- **Never hardcode** the key in source code
- **Never log** the full key (Cortex only logs first 12 chars)

## Master Key Rotation

To rotate the master key without downtime:

### Step 1: Generate New Key
```python
import secrets
new_key = secrets.token_urlsafe(32)
print(new_key)
```

### Step 2: Update Secret Manager
```bash
# Add new version to secret
echo -n "new-master-key-here" | gcloud secrets versions add cortex-master-key --data-file=-
```

### Step 3: Restart Service
```bash
# Cloud Run will automatically use the latest version
gcloud run services update cortex-ai-router --region=us-central1
```

### Step 4: Update Admin Users
- Notify all admin users of the new key
- They need to logout and login with the new key

### Step 5: Revoke Old Key (Optional)
```bash
# Disable old secret version
gcloud secrets versions disable VERSION_NUMBER --secret=cortex-master-key
```

## Multiple Environments

Use different keys for each environment:

### Development (.env)
```bash
KIRIO_CORTEX_MASTER_KEY=dev-key-local-only-not-secure
```

### Staging (Secret Manager)
```bash
gcloud secrets create cortex-master-key-staging \
  --data-file=- <<< "staging-secure-key-here"
```

### Production (Secret Manager)
```bash
gcloud secrets create cortex-master-key-production \
  --data-file=- <<< "production-secure-key-here"
```

## Automated Key Rotation Script

Create `rotate-master-key.sh`:

```bash
#!/bin/bash
set -e

PROJECT_ID="your-project-id"
SERVICE_NAME="cortex-ai-router"
REGION="us-central1"

echo "Generating new master key..."
NEW_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo "Updating secret in Google Secret Manager..."
echo -n "$NEW_KEY" | gcloud secrets versions add cortex-master-key \
  --data-file=- \
  --project=$PROJECT_ID

echo "Restarting Cloud Run service..."
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID

echo "✅ Master key rotated successfully!"
echo "⚠️  Please update all admin users with the new key"
echo "New key: $NEW_KEY"
echo ""
echo "🔒 Store this key securely and delete this output!"
```

Make it executable:
```bash
chmod +x rotate-master-key.sh
```

Run it:
```bash
./rotate-master-key.sh
```

## Verification

After changing the master key, verify it works:

### Test with curl:
```bash
# Should return 200 OK
curl -X GET https://your-domain.com/admin/v1/keys \
  -H "Authorization: Bearer your-new-master-key"

# Should return 401 Unauthorized
curl -X GET https://your-domain.com/admin/v1/keys \
  -H "Authorization: Bearer old-master-key"
```

### Test with Admin UI:
1. Open Admin UI
2. Login with new master key
3. Navigate to Settings page
4. Try to add a provider
5. Should work! ✅

## Troubleshooting

### "Invalid authentication" after changing key

**Problem**: Old key is cached somewhere

**Solutions**:
1. **Clear browser localStorage**:
   ```javascript
   localStorage.removeItem('cortex_master_key')
   location.reload()
   ```

2. **Restart backend**:
   ```bash
   # Stop and start the backend process
   ```

3. **Check .env file**:
   ```bash
   grep MASTER_KEY .env
   ```

4. **Verify Secret Manager** (production):
   ```bash
   gcloud secrets versions access latest --secret=cortex-master-key
   ```

### Backend still using old key

**Problem**: Environment variable not updated

**Solutions**:
1. **Check running process**:
   ```bash
   # Stop the backend completely
   # Update .env
   # Start backend again
   ```

2. **For Cloud Run**:
   ```bash
   # Force new deployment
   gcloud run services update cortex-ai-router \
     --region=us-central1 \
     --update-env-vars KIRIO_CORTEX_MASTER_KEY="new-key"
   ```

## Emergency Key Reset

If you lose the master key:

### Local Development:
1. Stop the backend
2. Edit `.env` file with a new key
3. Restart the backend
4. Login to Admin UI with new key

### Production:
1. Generate new key
2. Update Secret Manager
3. Redeploy Cloud Run service
4. Notify all admin users

**Note**: Losing the master key doesn't affect:
- User API keys (stored in database)
- Provider API keys (encrypted with separate encryption key)
- Application data

## Related Files

- `.env` - Local configuration
- `cortex/config.py` - Configuration loading
- `cortex/middleware/auth.py` - Authentication logic
- `cloud-run.yaml` - Production deployment config
- `setup-secrets.sh` - Secret setup script

## Deployment Checklist

Before deploying to production:

- [ ] Generate strong random master key (32+ characters)
- [ ] Store in Secret Manager (not in .env)
- [ ] Update cloud-run.yaml or use environment variables
- [ ] Test authentication with new key
- [ ] Document key location for team
- [ ] Set up key rotation schedule (90 days)
- [ ] Remove default key from all configs
- [ ] Verify .gitignore includes .env
- [ ] Test Admin UI login with new key
- [ ] Set up monitoring/alerts for auth failures

## Summary

**For Production Deployment:**

1. **Generate**: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
2. **Store**: Use Google Secret Manager
3. **Configure**: Update cloud-run.yaml or environment variables
4. **Deploy**: `gcloud run services replace cloud-run.yaml`
5. **Verify**: Test with curl and Admin UI
6. **Secure**: Never commit to git, rotate every 90 days

The master key is critical for security - treat it like a password! 🔒
