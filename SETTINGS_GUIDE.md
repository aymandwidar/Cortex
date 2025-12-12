# Settings Page - Secure API Key Management

## Overview

The Settings page allows you to securely manage AI provider API keys without storing them in `.env` files. All API keys are encrypted at rest using Fernet encryption.

## Features

- **Encrypted Storage**: API keys are encrypted before being stored in the database
- **Secure Display**: Only the last 4 characters of API keys are shown in the UI
- **Multiple Providers**: Support for 12+ AI providers
- **Easy Management**: Add, edit, and delete provider configurations through the UI

## Supported Providers

1. **OpenAI** - GPT-4, GPT-3.5, etc.
2. **Groq** - Fast inference with Llama models (FREE tier available)
3. **OpenRouter** - Access 100+ models with one API key (FREE models available)
4. **DeepSeek** - Cost-effective reasoning models
5. **Anthropic** - Claude models
6. **Google** - Gemini models (FREE tier available)
7. **Cohere** - Command models
8. **Mistral** - Mistral AI models
9. **Together AI** - Open source models (FREE tier available)
10. **Hugging Face** - Inference API (FREE tier available)
11. **Perplexity** - Search-augmented models
12. **Custom** - Any other provider

## How to Add a Provider

1. Navigate to the **Settings** page in the Admin UI
2. Click the **"Add Provider"** button
3. Fill in the form:
   - **Provider Name**: Select from the dropdown (e.g., "groq", "openai", "openrouter")
   - **API Key**: Enter your API key (it will be encrypted)
   - **Active**: Toggle whether this provider should be active
4. Click **"Add Provider"**
5. Your API key is now securely stored and encrypted

## How to Edit a Provider

1. Click the **Edit** icon next to the provider
2. Update the API key or active status
3. Click **"Save"** to apply changes

## How to Delete a Provider

1. Click the **Trash** icon next to the provider
2. Confirm the deletion
3. The provider and its encrypted API key will be removed

## Security Features

### Encryption at Rest
- API keys are encrypted using Fernet (symmetric encryption)
- Encryption key is stored in `.encryption_key` file
- **Important**: Keep `.encryption_key` secure and backed up

### API Key Preview
- Only the last 4 characters are displayed in the UI
- Full keys are never shown after creation
- Keys can only be decrypted by the backend

### Access Control
- Requires master key authentication
- Only admin users can access Settings page
- All operations are logged

## Backend API Endpoints

The Settings page uses these backend endpoints:

```
GET    /admin/v1/settings/providers              # List all providers
POST   /admin/v1/settings/providers              # Add new provider
GET    /admin/v1/settings/providers/{name}       # Get specific provider
PUT    /admin/v1/settings/providers/{name}       # Update provider
DELETE /admin/v1/settings/providers/{name}       # Delete provider
GET    /admin/v1/settings/providers/{name}/api-key  # Get decrypted key (backend only)
```

## Testing the Settings API

You can test the API using curl:

```bash
# List providers
curl -X GET http://localhost:8080/admin/v1/settings/providers \
  -H "Authorization: Bearer dev-master-key-change-in-production"

# Add a provider
curl -X POST http://localhost:8080/admin/v1/settings/providers \
  -H "Authorization: Bearer dev-master-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"provider_name":"groq","api_key":"your-api-key-here","is_active":true}'

# Get a specific provider
curl -X GET http://localhost:8080/admin/v1/settings/providers/groq \
  -H "Authorization: Bearer dev-master-key-change-in-production"

# Update a provider
curl -X PUT http://localhost:8080/admin/v1/settings/providers/groq \
  -H "Authorization: Bearer dev-master-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"api_key":"new-api-key","is_active":true}'

# Delete a provider
curl -X DELETE http://localhost:8080/admin/v1/settings/providers/groq \
  -H "Authorization: Bearer dev-master-key-change-in-production"
```

## Database Schema

Provider settings are stored in the `provider_settings` table:

```sql
CREATE TABLE provider_settings (
    provider_name VARCHAR(50) PRIMARY KEY,
    api_key_encrypted TEXT NOT NULL,
    model_config TEXT,  -- JSON string for additional configuration
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

1. **Use Free Tiers First**: Start with Groq, OpenRouter, and Gemini for free access
2. **Backup Encryption Key**: Keep `.encryption_key` file backed up securely
3. **Rotate Keys Regularly**: Update API keys periodically for security
4. **Monitor Usage**: Check provider usage in the Analytics page
5. **Disable Unused Providers**: Set `is_active: false` for providers you're not using

## Troubleshooting

### "Cannot add provider" Error
- **Fixed**: Import error with `require_master_key` vs `require_admin`
- **Solution**: Backend has been updated to use correct auth function

### Duplicate Path Error
- **Fixed**: Router prefix was duplicated (`/admin/v1/admin/v1/settings`)
- **Solution**: Settings router now uses `/settings` prefix

### Pydantic Field Error
- **Fixed**: `model_config` is a reserved name in Pydantic v2
- **Solution**: Renamed to `provider_config` throughout the codebase

## Next Steps

1. Add your free API keys (see `FREE_AI_MODELS.md`)
2. Configure OpenRouter for access to 100+ models (see `OPENROUTER_SETUP.md`)
3. Test the routing with different models
4. Monitor usage in the Analytics page

## Related Documentation

- `FREE_AI_MODELS.md` - Comprehensive guide to free AI models
- `OPENROUTER_SETUP.md` - OpenRouter setup and configuration
- `START_DEVELOPMENT.md` - Development environment setup
- `QUICKSTART.md` - Quick start guide
