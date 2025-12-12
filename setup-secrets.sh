#!/bin/bash
# Script to set up Google Cloud secrets for Cortex

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔐 Cortex Secrets Setup${NC}"
echo "======================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    exit 1
fi

# Check PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  PROJECT_ID not set${NC}"
    read -p "Enter your GCP Project ID: " PROJECT_ID
    export PROJECT_ID
fi

echo -e "${GREEN}Project ID: $PROJECT_ID${NC}"
echo ""

# Function to create secret
create_secret() {
    local secret_name=$1
    local secret_description=$2
    
    echo -e "${YELLOW}Creating secret: $secret_name${NC}"
    read -sp "Enter value for $secret_description: " secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        echo -e "${RED}❌ Empty value, skipping${NC}"
        return
    fi
    
    echo -n "$secret_value" | gcloud secrets create $secret_name \
        --data-file=- \
        --replication-policy="automatic" \
        --project=$PROJECT_ID 2>/dev/null || \
    echo -n "$secret_value" | gcloud secrets versions add $secret_name \
        --data-file=- \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✅ Secret $secret_name created/updated${NC}"
    echo ""
}

# Create secrets
echo -e "${GREEN}📝 Creating secrets...${NC}"
echo ""

create_secret "cortex-master-key" "Master Key (for admin access)"
create_secret "openai-api-key" "OpenAI API Key"
create_secret "groq-api-key" "Groq API Key"
create_secret "deepseek-api-key" "DeepSeek API Key"

read -p "Do you want to add Anthropic API key? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_secret "anthropic-api-key" "Anthropic API Key"
fi

# Grant access to Cloud Run service account
echo -e "${GREEN}🔑 Granting secret access to Cloud Run...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID

echo ""
echo -e "${GREEN}✅ Secrets setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Created secrets:${NC}"
gcloud secrets list --project=$PROJECT_ID --filter="name:cortex OR name:openai OR name:groq OR name:deepseek OR name:anthropic"
