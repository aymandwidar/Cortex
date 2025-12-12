# Cortex Production Deployment Checklist

Use this checklist to ensure a smooth deployment to Google Cloud Run.

---

## Pre-Deployment

### 1. Google Cloud Setup
- [ ] GCP project created with billing enabled
- [ ] gcloud CLI installed and authenticated
- [ ] Required APIs enabled:
  - [ ] Cloud Run API
  - [ ] Cloud Build API
  - [ ] Secret Manager API
  - [ ] Container Registry API
  - [ ] Cloud SQL API (if using PostgreSQL)
  - [ ] Redis API (if using Memorystore)

### 2. API Keys Ready
- [ ] OpenAI API key
- [ ] Groq API key
- [ ] DeepSeek API key
- [ ] Anthropic API key (optional)
- [ ] **Master key generated** (see `CHANGE_MASTER_KEY.md`)
  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] Master key stored securely (NOT in git)

### 3. Code Ready
- [ ] All tests passing (`pytest tests/`)
- [ ] Admin UI builds successfully (`cd admin-ui && npm run build`)
- [ ] Docker image builds locally (`docker build -f Dockerfile.production -t cortex:test .`)
- [ ] Environment variables configured

---

## Deployment Steps

### Step 1: Set Environment Variables
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export SERVICE_NAME="cortex"
```

- [ ] Environment variables set

### Step 2: Enable APIs
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com
```

- [ ] APIs enabled

### Step 3: Create Secrets
```bash
chmod +x setup-secrets.sh
./setup-secrets.sh
```

Or manually:
```bash
echo -n "your-master-key" | gcloud secrets create cortex-master-key --data-file=-
echo -n "sk-..." | gcloud secrets create openai-api-key --data-file=-
echo -n "gsk_..." | gcloud secrets create groq-api-key --data-file=-
echo -n "..." | gcloud secrets create deepseek-api-key --data-file=-
```

- [ ] Secrets created
- [ ] Secret access granted to Cloud Run service account

### Step 4: Build and Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:
```bash
# Build UI
cd admin-ui && npm install && npm run build && cd ..

# Build and push image
gcloud builds submit --tag gcr.io/$PROJECT_ID/cortex:latest -f Dockerfile.production

# Deploy to Cloud Run
gcloud run deploy cortex \
  --image gcr.io/$PROJECT_ID/cortex:latest \
  --region=$REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --min-instances 1 \
  --max-instances 10 \
  --set-secrets="KIRIO_CORTEX_MASTER_KEY=cortex-master-key:latest,OPENAI_API_KEY=openai-api-key:latest,GROQ_API_KEY=groq-api-key:latest,DEEPSEEK_API_KEY=deepseek-api-key:latest" \
  --set-env-vars="ENVIRONMENT=production,LOG_LEVEL=INFO"
```

- [ ] Docker image built
- [ ] Image pushed to GCR
- [ ] Service deployed to Cloud Run

### Step 5: Get Service URL
```bash
gcloud run services describe cortex --region=$REGION --format="value(status.url)"
```

- [ ] Service URL obtained

---

## Post-Deployment Testing

### Test Health Endpoints
```bash
SERVICE_URL="https://cortex-xxx-uc.a.run.app"

# Test health
curl $SERVICE_URL/health

# Test readiness
curl $SERVICE_URL/health/ready

# Test metrics
curl $SERVICE_URL/metrics
```

- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Readiness endpoint returns dependency status
- [ ] Metrics endpoint returns Prometheus metrics

### Test Admin UI
```bash
# Open in browser
open $SERVICE_URL
```

- [ ] Admin UI loads
- [ ] Login page appears
- [ ] Can login with master key
- [ ] Dashboard shows health status

### Generate API Key
```bash
curl -X POST $SERVICE_URL/admin/v1/generate_key \
  -H "Authorization: Bearer YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Test", "user_id": "test"}'
```

- [ ] API key generated successfully
- [ ] Key starts with `ctx_`
- [ ] Key visible in Admin UI

### Test Chat Completion
```bash
curl -X POST $SERVICE_URL/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hello from production!"}]
  }'
```

- [ ] Chat completion works
- [ ] Response received
- [ ] Model selection working
- [ ] No errors in logs

---

## Monitoring Setup

### View Logs
```bash
gcloud run services logs read cortex --region=$REGION --limit=50
```

- [ ] Logs accessible
- [ ] No error messages
- [ ] Startup successful

### View Metrics
- [ ] Open Cloud Console
- [ ] Navigate to Cloud Run > cortex > Metrics
- [ ] Verify metrics are being collected

### Set Up Alerts (Optional)
- [ ] High error rate alert (> 5%)
- [ ] High latency alert (> 2s p95)
- [ ] Low instance count alert (< 1)
- [ ] High memory usage alert (> 80%)

---

## Security Checklist

- [ ] All secrets in Secret Manager (not in code)
- [ ] Master key is strong and unique
- [ ] API keys are valid and active
- [ ] HTTPS enforced (automatic with Cloud Run)
- [ ] CORS configured properly
- [ ] Service account has minimal permissions
- [ ] Audit logging enabled

---

## Optional: Production Database

### Cloud SQL (PostgreSQL)
```bash
# Create instance
gcloud sql instances create cortex-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION

# Create database
gcloud sql databases create cortex --instance=cortex-db

# Create user
gcloud sql users create cortex-user \
  --instance=cortex-db \
  --password="SECURE_PASSWORD"

# Get connection name
gcloud sql instances describe cortex-db --format="value(connectionName)"
```

- [ ] Cloud SQL instance created
- [ ] Database created
- [ ] User created
- [ ] Connection string configured in Cloud Run

### Redis (Memorystore)
```bash
gcloud redis instances create cortex-redis \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0
```

- [ ] Redis instance created
- [ ] Connection configured in Cloud Run

---

## Optional: Custom Domain

```bash
gcloud run domain-mappings create \
  --service cortex \
  --domain cortex.yourdomain.com \
  --region=$REGION
```

- [ ] Domain mapped
- [ ] DNS records updated
- [ ] SSL certificate provisioned

---

## Optional: CI/CD Setup

```bash
# Create Cloud Build trigger
gcloud builds triggers create github \
  --repo-name=cortex \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

- [ ] GitHub repository connected
- [ ] Cloud Build trigger created
- [ ] Automatic deployments working

---

## Rollback Plan

If something goes wrong:

```bash
# List revisions
gcloud run revisions list --service=cortex --region=$REGION

# Rollback to previous revision
gcloud run services update-traffic cortex \
  --to-revisions=REVISION_NAME=100 \
  --region=$REGION
```

- [ ] Rollback procedure documented
- [ ] Previous revision identified
- [ ] Team knows how to rollback

---

## Documentation

- [ ] Service URL documented
- [ ] Master key stored securely (password manager)
- [ ] API keys documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created
- [ ] Team trained on deployment

---

## Cost Monitoring

- [ ] Budget alert set up
- [ ] Cost dashboard created
- [ ] Monthly cost estimate documented
- [ ] Cost optimization plan in place

---

## Success Criteria

- [ ] Service is accessible via HTTPS
- [ ] Admin UI loads and works
- [ ] API keys can be generated
- [ ] Chat completions work
- [ ] Health checks pass
- [ ] Metrics are collected
- [ ] Logs are accessible
- [ ] No errors in production
- [ ] Response time < 2s
- [ ] Uptime > 99%

---

## Next Steps After Deployment

1. [ ] Monitor for 24 hours
2. [ ] Set up staging environment
3. [ ] Configure monitoring dashboards (Phase 5)
4. [ ] Add enhanced UI features (Phase 4.1)
5. [ ] Add multimodal support (Phase 6)
6. [ ] Set up load testing
7. [ ] Document runbooks
8. [ ] Train team on operations

---

## Support Contacts

- **GCP Support**: https://cloud.google.com/support
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Cortex Docs**: See `PRODUCTION_DEPLOYMENT.md`

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Service URL**: _______________  
**Status**: ⬜ Success ⬜ Issues ⬜ Rollback

---

✅ **Deployment Complete!** 🚀
