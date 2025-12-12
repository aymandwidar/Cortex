# Production Deployment Guide - Complete

## Pre-Deployment Checklist

### 1. Security ✅
- [ ] Change master key: `python generate-master-key.py`
- [ ] Update `.env` with production values
- [ ] Remove test API keys
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Configure CORS properly

### 2. Configuration ✅
- [ ] Update `ALLOWED_ORIGINS` in `.env`
- [ ] Set `LOG_LEVEL=INFO` or `WARNING`
- [ ] Configure database (PostgreSQL recommended for production)
- [ ] Set up Redis (optional, for caching)
- [ ] Set up Qdrant (optional, for memory features)

### 3. Provider Keys ✅
- [ ] Add production API keys in Settings page
- [ ] Test all providers
- [ ] Set up rate limits
- [ ] Configure fallbacks

### 4. Monitoring ✅
- [ ] Set up logging
- [ ] Configure metrics collection
- [ ] Set up alerts
- [ ] Test health endpoints

## Deployment Options

### Option 1: Google Cloud Run (Recommended)

**Why Cloud Run?**
- Automatic scaling
- Pay only for what you use
- HTTPS included
- Easy deployment
- No server management

**Steps:**

1. **Install Google Cloud SDK**
```bash
# Download from: https://cloud.google.com/sdk/docs/install
gcloud init
```

2. **Set up project**
```bash
# Create project
gcloud projects create cortex-ai-router

# Set project
gcloud config set project cortex-ai-router

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

3. **Create secrets**
```bash
# Master key
echo -n "your-production-master-key" | \
  gcloud secrets create cortex-master-key --data-file=-

# Provider keys (add in Settings UI after deployment)
```

4. **Deploy**
```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml

# Or use the deploy script
chmod +x deploy.sh
./deploy.sh
```

5. **Configure domain (optional)**
```bash
# Map custom domain
gcloud run services update cortex \
  --region us-central1 \
  --add-custom-domain your-domain.com
```

6. **Access your service**
```
https://cortex-xxxxx-uc.a.run.app
```

### Option 2: Docker + Any Cloud Provider

**Build Docker image:**
```bash
docker build -f Dockerfile.production -t cortex:latest .
```

**Run locally:**
```bash
docker run -p 8080:8080 \
  -e KIRIO_CORTEX_MASTER_KEY=your-master-key \
  -e GROQ_API_KEY=your-groq-key \
  cortex:latest
```

**Push to registry:**
```bash
# Docker Hub
docker tag cortex:latest yourusername/cortex:latest
docker push yourusername/cortex:latest

# Google Container Registry
docker tag cortex:latest gcr.io/your-project/cortex:latest
docker push gcr.io/your-project/cortex:latest

# AWS ECR
docker tag cortex:latest aws_account_id.dkr.ecr.region.amazonaws.com/cortex:latest
docker push aws_account_id.dkr.ecr.region.amazonaws.com/cortex:latest
```

**Deploy to:**
- **AWS ECS/Fargate**: Use task definition
- **Azure Container Instances**: Use `az container create`
- **DigitalOcean App Platform**: Connect to registry
- **Heroku**: Use container registry

### Option 3: Traditional Server (VPS)

**Requirements:**
- Ubuntu 20.04+ or similar
- Python 3.9+
- Node.js 18+
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Install dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.9 python3-pip -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

2. **Clone and setup**
```bash
# Clone repository
git clone https://github.com/yourusername/cortex.git
cd cortex

# Install Python dependencies
pip3 install -r requirements.txt

# Build frontend
cd admin-ui
npm install
npm run build
cd ..
```

3. **Configure environment**
```bash
# Copy and edit .env
cp .env.example .env
nano .env

# Set production values
KIRIO_CORTEX_MASTER_KEY=your-production-master-key
DATABASE_URL=postgresql://user:pass@localhost/cortex
LOG_LEVEL=INFO
ALLOWED_ORIGINS=["https://yourdomain.com"]
```

4. **Set up systemd service**
```bash
sudo nano /etc/systemd/system/cortex.service
```

```ini
[Unit]
Description=Cortex AI Router
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/cortex
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/local/bin/uvicorn cortex.main:app --host 0.0.0.0 --port 8080
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable cortex
sudo systemctl start cortex
sudo systemctl status cortex
```

5. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/cortex
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cortex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Set up SSL**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Option 4: Kubernetes

**Create deployment:**
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cortex
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cortex
  template:
    metadata:
      labels:
        app: cortex
    spec:
      containers:
      - name: cortex
        image: gcr.io/your-project/cortex:latest
        ports:
        - containerPort: 8080
        env:
        - name: KIRIO_CORTEX_MASTER_KEY
          valueFrom:
            secretKeyRef:
              name: cortex-secrets
              key: master-key
---
apiVersion: v1
kind: Service
metadata:
  name: cortex
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: cortex
```

```bash
kubectl apply -f deployment.yaml
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://your-domain.com/health

# Test API
curl -X POST https://your-domain.com/v1/chat/completions \
  -H "Authorization: Bearer ctx_your_key" \
  -H "Content-Type: application/json" \
  -d '{"model":"reflex-model","messages":[{"role":"user","content":"Hello"}]}'
```

### 2. Add Provider Keys

1. Go to https://your-domain.com/settings
2. Login with master key
3. Add provider API keys:
   - Groq
   - OpenRouter
   - Google

### 3. Create API Keys

```bash
# Create production API key
curl -X POST https://your-domain.com/admin/v1/generate_key \
  -H "Authorization: Bearer your-master-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Production App","user_id":"prod-user"}'
```

### 4. Set Up Monitoring

**Google Cloud Monitoring:**
```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cortex High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

**Prometheus + Grafana:**
```bash
# Metrics available at /metrics
curl https://your-domain.com/metrics
```

### 5. Set Up Logging

**Google Cloud Logging:**
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

**Traditional server:**
```bash
# View logs
sudo journalctl -u cortex -f
```

## Scaling

### Horizontal Scaling

**Cloud Run:**
- Automatic scaling (0 to 1000 instances)
- Configure max instances:
```bash
gcloud run services update cortex \
  --max-instances=100 \
  --min-instances=1
```

**Kubernetes:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cortex-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cortex
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling

**PostgreSQL:**
- Use connection pooling (PgBouncer)
- Read replicas for analytics
- Vertical scaling for write performance

**Redis:**
- Use Redis Cluster for horizontal scaling
- Separate cache and session storage

## Backup & Recovery

### Database Backup

**Automated backups:**
```bash
# PostgreSQL
pg_dump cortex > backup_$(date +%Y%m%d).sql

# Cron job
0 2 * * * pg_dump cortex > /backups/cortex_$(date +\%Y\%m\%d).sql
```

**Cloud SQL (Google Cloud):**
- Automatic daily backups
- Point-in-time recovery
- Cross-region replication

### Disaster Recovery

1. **Regular backups**: Daily database backups
2. **Multi-region**: Deploy to multiple regions
3. **Health checks**: Automatic failover
4. **Documentation**: Keep runbooks updated

## Security Best Practices

### 1. API Keys
- Rotate keys regularly
- Use different keys for different environments
- Never commit keys to git
- Use secrets manager

### 2. Network Security
- Enable HTTPS only
- Configure CORS properly
- Use firewall rules
- Rate limiting

### 3. Database Security
- Use strong passwords
- Enable SSL connections
- Regular security updates
- Backup encryption

### 4. Monitoring
- Log all API requests
- Alert on suspicious activity
- Monitor error rates
- Track usage patterns

## Cost Optimization

### Free Tier Usage

**Groq**: Free (generous limits)
**Google Gemini**: 60 req/min free
**OpenRouter**: $0.10 free credits

**Estimated costs (with free tiers):**
- API providers: $0/month
- Cloud Run: ~$5-20/month (depending on usage)
- Database: ~$10/month (Cloud SQL)
- Total: ~$15-30/month

### Cost Reduction Tips

1. **Use free providers**: Groq, Gemini
2. **Cache responses**: Reduce API calls
3. **Optimize models**: Use smaller models when possible
4. **Set rate limits**: Prevent abuse
5. **Monitor usage**: Track and optimize

## Troubleshooting

### Common Issues

**1. 502 Bad Gateway**
- Check if backend is running
- Verify port configuration
- Check logs for errors

**2. High latency**
- Check provider API status
- Optimize database queries
- Add caching layer

**3. Out of memory**
- Increase container memory
- Optimize code
- Add memory limits

**4. Rate limit errors**
- Increase provider limits
- Add caching
- Implement request queuing

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check API usage
- Review logs

**Weekly:**
- Update dependencies
- Review security alerts
- Backup verification

**Monthly:**
- Rotate API keys
- Update documentation
- Performance review

## Support

For production issues:
1. Check logs first
2. Review monitoring dashboards
3. Test with health endpoints
4. Check provider status pages

## Success Metrics

Track these metrics:
- ✅ Uptime > 99.9%
- ✅ Response time < 500ms (p95)
- ✅ Error rate < 1%
- ✅ Cost per request < $0.001

## Conclusion

Your Cortex AI Router is now production-ready! 🚀

**Next steps:**
1. Choose deployment option
2. Follow deployment steps
3. Configure monitoring
4. Test thoroughly
5. Go live!

Good luck with your deployment!
