#!/bin/bash
# Cortex Production Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Cortex Production Deployment${NC}"
echo "=================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  PROJECT_ID not set. Please set it:${NC}"
    echo "export PROJECT_ID=your-project-id"
    exit 1
fi

REGION=${REGION:-us-central1}
SERVICE_NAME=${SERVICE_NAME:-cortex}

echo -e "${GREEN}📋 Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Step 1: Build Admin UI
echo -e "${GREEN}📦 Building Admin UI...${NC}"
cd admin-ui
npm install
npm run build
cd ..

# Step 2: Build Docker image
echo -e "${GREEN}🐳 Building Docker image...${NC}"
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:latest -f Dockerfile.production

# Step 3: Deploy to Cloud Run
echo -e "${GREEN}☁️  Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --region=$REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --min-instances 1 \
  --max-instances 10

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${GREEN}🌐 Service URL:${NC} $SERVICE_URL"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Test health: curl $SERVICE_URL/health"
echo "  2. Open Admin UI: $SERVICE_URL"
echo "  3. Generate API key via Admin UI"
echo "  4. Test chat completion"
echo ""
echo -e "${GREEN}🎉 Cortex is now live!${NC}"
