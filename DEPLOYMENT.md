# Cortex Deployment Guide

## Prerequisites

- Docker installed
- Google Cloud SDK (gcloud) installed
- Redis instance (Redis Cloud free tier or self-hosted)
- Qdrant instance (Qdrant Cloud free tier or self-hosted)
- API keys for: OpenAI, Groq, DeepSeek, Anthropic

## Local Development

### 1. Set up environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys and configuration
nano .env
```

### 2. Install dependencies

```bash
# Using pip
pip install -r requirements.txt

# Or using poetry
poetry install
```

### 3. Start Redis and Qdrant locally

```bash
# Redis
docker run -d -p 6379:6379 redis:latest

# Qdrant
docker run -d -p 6333:6333 qdrant/qdrant:latest
```

### 4. Run the application

```bash
uvicorn cortex.main:app --reload --port 8080
```

### 5. Test the endpoint

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Docker Deployment

### 1. Build the image

```bash
docker build -t cortex:latest .
```

### 2. Run the container

```bash
docker run -p 8080:8080 \
  --env-file .env \
  cortex:latest
```

## Google Cloud Run Deployment

### 1. Set up Google Cloud project

```bash
# Set project ID
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Create secrets

```bash
# Create secrets for API keys
echo -n "your-master-key" | gcloud secrets create cortex-master-key --data-file=-
echo -n "your-openai-key" | gcloud secrets create openai-api-key --data-file=-
echo -n "your-groq-key" | gcloud secrets create groq-api-key --data-file=-
echo -n "your-deepseek-key" | gcloud secrets create deepseek-api-key --data-file=-
echo -n "your-anthropic-key" | gcloud secrets create anthropic-api-key --data-file=-
```

### 3. Build and push image

```bash
# Build for Cloud Run
gcloud builds submit --tag gcr.io/$PROJECT_ID/cortex

# Or build locally and push
docker build -t gcr.io/$PROJECT_ID/cortex .
docker push gcr.io/$PROJECT_ID/cortex
```

### 4. Deploy to Cloud Run

```bash
# Update cloud-run.yaml with your PROJECT_ID, REDIS_HOST, and QDRANT_HOST

# Deploy
gcloud run services replace cloud-run.yaml

# Or use gcloud command directly
gcloud run deploy cortex \
  --image gcr.io/$PROJECT_ID/cortex \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars REDIS_URL=redis://YOUR_REDIS_HOST:6379 \
  --set-env-vars QDRANT_URL=http://YOUR_QDRANT_HOST:6333 \
  --set-secrets KIRIO_CORTEX_MASTER_KEY=cortex-master-key:latest \
  --set-secrets OPENAI_API_KEY=openai-api-key:latest \
  --set-secrets GROQ_API_KEY=groq-api-key:latest \
  --set-secrets DEEPSEEK_API_KEY=deepseek-api-key:latest \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

### 5. Get the service URL

```bash
gcloud run services describe cortex --region us-central1 --format 'value(status.url)'
```

## Testing the Deployment

```bash
# Get your Cloud Run URL
export CORTEX_URL=$(gcloud run services describe cortex --region us-central1 --format 'value(status.url)')

# Test the endpoint
curl -X POST $CORTEX_URL/v1/chat/completions \
  -H "Authorization: Bearer your-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Write a Python function to sort a list"}]
  }'
```

## Monitoring

### View logs

```bash
gcloud run services logs read cortex --region us-central1
```

### View metrics

```bash
# In Google Cloud Console
# Navigate to: Cloud Run > cortex > Metrics
```

## Scaling Configuration

The default configuration in `cloud-run.yaml`:
- Min instances: 0 (scales to zero when idle)
- Max instances: 10
- CPU: 2 cores
- Memory: 2GB
- Timeout: 60 seconds

Adjust these values based on your traffic patterns and budget.

## Cost Optimization

- Cloud Run: Free tier includes 2 million requests/month
- Redis: Use Redis Cloud free tier (30MB)
- Qdrant: Use Qdrant Cloud free tier (1GB)
- LLM costs: Semantic routing minimizes expensive model usage

## Troubleshooting

### Container fails to start

Check logs:
```bash
gcloud run services logs read cortex --region us-central1 --limit 50
```

### Redis connection issues

Verify Redis URL and network connectivity:
```bash
# Test Redis connection
redis-cli -h YOUR_REDIS_HOST ping
```

### Qdrant connection issues

Verify Qdrant URL:
```bash
curl http://YOUR_QDRANT_HOST:6333/collections
```

### API key issues

Verify secrets are properly set:
```bash
gcloud secrets versions access latest --secret cortex-master-key
```

## Security Best Practices

1. Never commit API keys to version control
2. Use Google Cloud Secret Manager for sensitive data
3. Restrict Cloud Run service to authenticated requests in production
4. Enable VPC connector for private Redis/Qdrant access
5. Implement rate limiting per user_id
6. Regularly rotate API keys
7. Monitor for unusual usage patterns

## Updates and Maintenance

### Deploy new version

```bash
# Build new image
gcloud builds submit --tag gcr.io/$PROJECT_ID/cortex

# Deploy (Cloud Run will handle zero-downtime deployment)
gcloud run services update cortex \
  --image gcr.io/$PROJECT_ID/cortex \
  --region us-central1
```

### Rollback

```bash
# List revisions
gcloud run revisions list --service cortex --region us-central1

# Rollback to previous revision
gcloud run services update-traffic cortex \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```
