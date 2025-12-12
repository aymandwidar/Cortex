# Production Deployment Guide - Google Cloud Run

Complete guide to deploying Cortex AI Router to production on Google Cloud Run.

---

## Prerequisites

### Required Tools
- Google Cloud SDK (`gcloud`)
- Docker
- Git
- Access to a GCP project with billing enabled

### Required Services
- Google Cloud Run
- Google Cloud SQL (PostgreSQL) - for production database
- Google Cloud Memorystore (Redis) - for caching
- Qdrant Cloud or self-hosted Qdrant

### API Keys
- OpenAI API key
- Groq API key
- DeepSeek API key
- Anthropic API key (optional)

---

## Step 1: Set Up Google Cloud Project

### 1.1 Install and Configure gcloud

```bash
# Install gcloud CLI (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  containerregistry.googleapis.com
```

### 1.2 Set Environment Variables

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export SERVICE_NAME="cortex"
```

---

## Step 2: Set Up Secrets

Store sensitive data in Google Secret Manager:

```bash
# Create master key secret
echo -n "your-secure-master-key-here" | \
  gcloud secrets create cortex-master-key \
  --data-file=- \
  --replication-policy="automatic"

# Create OpenAI API key secret
echo -n "sk-your-openai-key" | \
  gcloud secrets create openai-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Create Groq API key secret
echo -n "gsk_your-groq-key" | \
  gcloud secrets create groq-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Create DeepSeek API key secret
echo -n "your-deepseek-key" | \
  gcloud secrets create deepseek-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Create Anthropic API key secret (optional)
echo -n "your-anthropic-key" | \
  gcloud secrets create anthropic-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Grant Cloud Run access to secrets
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Step 3: Set Up Cloud SQL (PostgreSQL)

### 3.1 Create PostgreSQL Instance

```bash
gcloud sql instances create cortex-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password="your-secure-db-password"

# Create database
gcloud sql databases create cortex \
  --instance=cortex-db

# Create user
gcloud sql users create cortex-user \
  --instance=cortex-db \
  --password="your-secure-user-password"
```

### 3.2 Store Database Password in Secret Manager

```bash
echo -n "your-secure-user-password" | \
  gcloud secrets create cortex-db-password \
  --data-file=- \
  --replication-policy="automatic"
```

### 3.3 Get Connection String

```bash
# Get connection name
gcloud sql instances describe cortex-db --format="value(connectionName)"

# Connection string format:
# postgresql://cortex-user:PASSWORD@/cortex?host=/cloudsql/CONNECTION_NAME
```

---

## Step 4: Set Up Redis (Memorystore)

### 4.1 Create Redis Instance

```bash
gcloud redis instances create cortex-redis \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0 \
  --tier=basic

# Get Redis host
gcloud redis instances describe cortex-redis \
  --region=$REGION \
  --format="value(host)"
```

---

## Step 5: Set Up Qdrant

### Option A: Qdrant Cloud (Recommended)

1. Sign up at https://cloud.qdrant.io
2. Create a cluster
3. Get API key and URL
4. Store in Secret Manager:

```bash
echo -n "your-qdrant-url" | \
  gcloud secrets create qdrant-url \
  --data-file=- \
  --replication-policy="automatic"

echo -n "your-qdrant-api-key" | \
  gcloud secrets create qdrant-api-key \
  --data-file=- \
  --replication-policy="automatic"
```

### Option B: Self-Hosted on GCE

```bash
# Create VM for Qdrant
gcloud compute instances create qdrant-server \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB

# SSH and install Qdrant
gcloud compute ssh qdrant-server --zone=us-central1-a

# On the VM:
docker run -d -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

---

## Step 6: Build and Push Docker Image

### 6.1 Build the Image

```bash
# Build with Admin UI included
docker build -f Dockerfile.production -t gcr.io/$PROJECT_ID/cortex:latest .

# Or use Cloud Build (recommended)
gcloud builds submit --tag gcr.io/$PROJECT_ID/cortex:latest -f Dockerfile.production
```

### 6.2 Test Locally (Optional)

```bash
docker run -p 8080:8080 \
  -e KIRIO_CORTEX_MASTER_KEY="test-key" \
  -e OPENAI_API_KEY="sk-..." \
  -e DATABASE_URL="sqlite+aiosqlite:///./cortex.db" \
  gcr.io/$PROJECT_ID/cortex:latest
```

---

## Step 7: Deploy to Cloud Run

### 7.1 Create deployment configuration

Create `cloud-run-production.yaml`:

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: cortex
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/cloudsql-instances: PROJECT_ID:REGION:cortex-db
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '1'
        autoscaling.knative.dev/maxScale: '10'
        run.googleapis.com/cpu-throttling: 'false'
        run.googleapis.com/vpc-access-connector: projects/PROJECT_ID/locations/REGION/connectors/cortex-connector
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/PROJECT_ID/cortex:latest
        ports:
        - name: http1
          containerPort: 8080
        env:
        - name: KIRIO_CORTEX_MASTER_KEY
          valueFrom:
            secretKeyRef:
              name: cortex-master-key
              key: latest
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-api-key
              key: latest
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: groq-api-key
              key: latest
        - name: DEEPSEEK_API_KEY
          valueFrom:
            secretKeyRef:
              name: deepseek-api-key
              key: latest
        - name: DATABASE_URL
          value: "postgresql://cortex-user:$(DB_PASSWORD)@/cortex?host=/cloudsql/PROJECT_ID:REGION:cortex-db"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: cortex-db-password
              key: latest
        - name: REDIS_URL
          value: "redis://REDIS_HOST:6379"
        - name: QDRANT_URL
          valueFrom:
            secretKeyRef:
              name: qdrant-url
              key: latest
        - name: QDRANT_API_KEY
          valueFrom:
            secretKeyRef:
              name: qdrant-api-key
              key: latest
        - name: ENVIRONMENT
          value: "production"
        - name: LOG_LEVEL
          value: "INFO"
        resources:
          limits:
            cpu: '2'
            memory: 4Gi
        startupProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          periodSeconds: 10
```

### 7.2 Deploy

```bash
# Deploy using gcloud
gcloud run services replace cloud-run-production.yaml \
  --region=$REGION

# Or deploy directly
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
  --set-env-vars="REDIS_URL=redis://REDIS_HOST:6379,ENVIRONMENT=production"
```

### 7.3 Get Service URL

```bash
gcloud run services describe cortex \
  --region=$REGION \
  --format="value(status.url)"
```

---

## Step 8: Configure Custom Domain (Optional)

### 8.1 Map Domain

```bash
gcloud run domain-mappings create \
  --service cortex \
  --domain cortex.yourdomain.com \
  --region=$REGION
```

### 8.2 Update DNS

Add the DNS records shown by the command above to your domain registrar.

---

## Step 9: Set Up Monitoring

### 9.1 Enable Cloud Monitoring

```bash
# Monitoring is enabled by default for Cloud Run
# View logs
gcloud run services logs read cortex --region=$REGION --limit=50

# View metrics in Cloud Console
# https://console.cloud.google.com/run/detail/REGION/cortex/metrics
```

### 9.2 Set Up Alerts

Create alert policies in Cloud Console:
- High error rate (> 5%)
- High latency (> 2s p95)
- Low instance count (< 1)
- High memory usage (> 80%)

---

## Step 10: Test Production Deployment

### 10.1 Test Health Endpoints

```bash
SERVICE_URL=$(gcloud run services describe cortex --region=$REGION --format="value(status.url)")

# Test health
curl $SERVICE_URL/health

# Test readiness
curl $SERVICE_URL/health/ready

# Test metrics
curl $SERVICE_URL/metrics
```

### 10.2 Test Admin UI

```bash
# Open in browser
open $SERVICE_URL
```

### 10.3 Generate API Key

```bash
curl -X POST $SERVICE_URL/admin/v1/generate_key \
  -H "Authorization: Bearer YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Test Key", "user_id": "test-user"}'
```

### 10.4 Test Chat Completion

```bash
curl -X POST $SERVICE_URL/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_GENERATED_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hello from production!"}]
  }'
```

---

## Step 11: Set Up CI/CD (Optional)

### 11.1 Create Cloud Build Trigger

Create `cloudbuild.yaml`:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-f', 'Dockerfile.production', '-t', 'gcr.io/$PROJECT_ID/cortex:$COMMIT_SHA', '.']
  
  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/cortex:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'cortex'
      - '--image'
      - 'gcr.io/$PROJECT_ID/cortex:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/cortex:$COMMIT_SHA'
```

### 11.2 Create Trigger

```bash
gcloud builds triggers create github \
  --repo-name=cortex \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

---

## Cost Optimization

### Estimated Monthly Costs

**Minimal Usage** (~$50-100/month):
- Cloud Run: $10-20 (1 instance, low traffic)
- Cloud SQL: $10-15 (db-f1-micro)
- Redis: $15-20 (1GB basic)
- Qdrant Cloud: $0-25 (free tier or starter)

**Medium Usage** (~$200-300/month):
- Cloud Run: $50-100 (2-5 instances)
- Cloud SQL: $50-75 (db-g1-small)
- Redis: $50-75 (5GB standard)
- Qdrant Cloud: $50-100 (production tier)

### Cost Reduction Tips

1. **Use min-instances: 0** for dev/staging
2. **Enable CPU throttling** for non-critical workloads
3. **Use Cloud SQL proxy** instead of public IP
4. **Set up budget alerts** in Cloud Console
5. **Use committed use discounts** for predictable workloads

---

## Security Checklist

- [ ] All secrets stored in Secret Manager
- [ ] Cloud SQL uses private IP
- [ ] Redis uses VPC connector
- [ ] Cloud Run uses service account with minimal permissions
- [ ] HTTPS enforced (automatic with Cloud Run)
- [ ] CORS configured properly
- [ ] Rate limiting enabled (add in future)
- [ ] API keys rotated regularly
- [ ] Audit logs enabled
- [ ] VPC Service Controls configured (enterprise)

---

## Backup and Disaster Recovery

### Database Backups

```bash
# Enable automated backups
gcloud sql instances patch cortex-db \
  --backup-start-time=03:00 \
  --enable-bin-log

# Create manual backup
gcloud sql backups create \
  --instance=cortex-db \
  --description="Pre-deployment backup"
```

### Restore from Backup

```bash
# List backups
gcloud sql backups list --instance=cortex-db

# Restore
gcloud sql backups restore BACKUP_ID \
  --backup-instance=cortex-db \
  --backup-id=BACKUP_ID
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
gcloud run services logs read cortex --region=$REGION --limit=100

# Check service status
gcloud run services describe cortex --region=$REGION

# Check secrets access
gcloud secrets versions access latest --secret=cortex-master-key
```

### High Latency

- Check Cloud SQL connection pooling
- Verify Redis connectivity
- Review Qdrant performance
- Check Cloud Run instance count
- Review application logs for slow queries

### Database Connection Issues

- Verify Cloud SQL proxy is configured
- Check VPC connector
- Verify database credentials
- Check connection string format

---

## Maintenance

### Update Application

```bash
# Build new image
gcloud builds submit --tag gcr.io/$PROJECT_ID/cortex:v2

# Deploy with zero downtime
gcloud run deploy cortex \
  --image gcr.io/$PROJECT_ID/cortex:v2 \
  --region=$REGION
```

### Scale Up/Down

```bash
# Increase max instances
gcloud run services update cortex \
  --max-instances=20 \
  --region=$REGION

# Set minimum instances
gcloud run services update cortex \
  --min-instances=2 \
  --region=$REGION
```

### Rotate Secrets

```bash
# Add new secret version
echo -n "new-master-key" | \
  gcloud secrets versions add cortex-master-key --data-file=-

# Update service to use new version
gcloud run services update cortex \
  --update-secrets=KIRIO_CORTEX_MASTER_KEY=cortex-master-key:latest \
  --region=$REGION
```

---

## Next Steps After Deployment

1. **Set up monitoring dashboards** (Phase 5)
2. **Configure alerts** for critical metrics
3. **Set up log aggregation** with Cloud Logging
4. **Enable Cloud Trace** for request tracing
5. **Set up load testing** to verify capacity
6. **Document runbooks** for common issues
7. **Set up staging environment** for testing

---

## Support

- Cloud Run docs: https://cloud.google.com/run/docs
- Cloud SQL docs: https://cloud.google.com/sql/docs
- Secret Manager docs: https://cloud.google.com/secret-manager/docs

---

**Deployment Status**: Ready for production! 🚀
