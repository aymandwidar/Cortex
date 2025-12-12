# OpenRouter Setup Guide

OpenRouter gives you access to **100+ AI models** with a single API key, including many **free models**!

---

## 🎯 Why OpenRouter?

- **One API Key**: Access 100+ models with one key
- **Many Free Models**: 10+ completely free models
- **Unified Interface**: Same API for all models
- **Automatic Fallbacks**: Built-in redundancy
- **Cost Tracking**: See costs per model
- **No Vendor Lock-in**: Switch models easily

---

## 🚀 Quick Setup

### Step 1: Get API Key

1. Visit: https://openrouter.ai
2. Sign up with email or GitHub
3. Go to: https://openrouter.ai/keys
4. Click "Create Key"
5. Copy your API key (starts with `sk-or-v1-...`)

### Step 2: Add to Cortex

**Option A: Via Settings UI** (Recommended):
1. Open Cortex Admin UI: http://localhost:3000
2. Go to **Settings**
3. Click **Add Provider**
4. Select **OpenRouter**
5. Paste your API key
6. Click **Add Provider**

**Option B: Via .env file**:
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Step 3: Configure Models

Update `config.yaml`:

```yaml
model_list:
  # Free Llama 3.2 via OpenRouter
  - model_name: reflex-model
    litellm_params:
      model: openrouter/meta-llama/llama-3.2-3b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
  
  # Free Hermes 405B (Best Free Model!)
  - model_name: genius-model
    litellm_params:
      model: openrouter/nousresearch/hermes-3-llama-3.1-405b:free
      api_key: os.environ/OPENROUTER_API_KEY
  
  # Free Mistral
  - model_name: analyst-model
    litellm_params:
      model: openrouter/mistralai/mistral-7b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
```

---

## 🆓 Free Models on OpenRouter

### Best Free Models:

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **Hermes 3 Llama 405B** | 405B | ⚡⚡ | ⭐⭐⭐⭐⭐ | Complex reasoning |
| **Llama 3.2 3B** | 3B | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Fast responses |
| **Mistral 7B** | 7B | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | General purpose |
| **Gemma 2 9B** | 9B | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Balanced |
| **Phi-3 Mini** | 3.8B | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Small tasks |

### Full List of Free Models:

```yaml
# View all free models at:
# https://openrouter.ai/models?free=true

Free Models:
  - meta-llama/llama-3.2-3b-instruct:free
  - meta-llama/llama-3.2-1b-instruct:free
  - nousresearch/hermes-3-llama-3.1-405b:free
  - mistralai/mistral-7b-instruct:free
  - google/gemma-2-9b-it:free
  - microsoft/phi-3-mini-128k-instruct:free
  - openchat/openchat-7b:free
  - undi95/toppy-m-7b:free
```

---

## 📝 Example Configurations

### Configuration 1: All Free Models

```yaml
model_list:
  # Fast & Small
  - model_name: fast-chat
    litellm_params:
      model: openrouter/meta-llama/llama-3.2-3b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
  
  # Balanced
  - model_name: balanced
    litellm_params:
      model: openrouter/mistralai/mistral-7b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
  
  # Best Quality (Free!)
  - model_name: best-free
    litellm_params:
      model: openrouter/nousresearch/hermes-3-llama-3.1-405b:free
      api_key: os.environ/OPENROUTER_API_KEY
```

### Configuration 2: Mixed (Free + Paid)

```yaml
model_list:
  # Free for simple tasks
  - model_name: simple-tasks
    litellm_params:
      model: openrouter/meta-llama/llama-3.2-3b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
  
  # Paid for complex tasks (very cheap)
  - model_name: complex-tasks
    litellm_params:
      model: openrouter/meta-llama/llama-3.1-70b-instruct
      api_key: os.environ/OPENROUTER_API_KEY
      # Cost: ~$0.0005 per request
```

---

## 🎯 Recommended Setup

### Best Free Setup with OpenRouter:

```yaml
model_list:
  # Groq for speed (primary)
  - model_name: reflex-model
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
  
  # OpenRouter free for variety (backup)
  - model_name: analyst-model
    litellm_params:
      model: openrouter/mistralai/mistral-7b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
  
  # OpenRouter 405B for complex (genius)
  - model_name: genius-model
    litellm_params:
      model: openrouter/nousresearch/hermes-3-llama-3.1-405b:free
      api_key: os.environ/OPENROUTER_API_KEY
```

**Why this works**:
- Groq is fastest for most requests
- OpenRouter provides variety and fallback
- 405B model for complex reasoning (still free!)

---

## 💡 Advanced Features

### 1. Model Routing

OpenRouter can automatically route to best available model:

```yaml
- model_name: auto-route
  litellm_params:
    model: openrouter/auto
    api_key: os.environ/OPENROUTER_API_KEY
```

### 2. Fallback Chain

```yaml
- model_name: reliable
  litellm_params:
    model: openrouter/meta-llama/llama-3.2-3b-instruct:free
    api_key: os.environ/OPENROUTER_API_KEY
    fallbacks:
      - openrouter/mistralai/mistral-7b-instruct:free
      - openrouter/google/gemma-2-9b-it:free
```

### 3. Custom Headers

```yaml
- model_name: custom
  litellm_params:
    model: openrouter/meta-llama/llama-3.2-3b-instruct:free
    api_key: os.environ/OPENROUTER_API_KEY
    extra_headers:
      HTTP-Referer: https://your-site.com
      X-Title: Your App Name
```

---

## 📊 Usage Tracking

### View Usage:

1. Visit: https://openrouter.ai/activity
2. See requests per model
3. Track costs (free models show $0)
4. Monitor rate limits

### In Cortex:

1. Go to **Analytics** page
2. View requests by model
3. See cost breakdown
4. Monitor performance

---

## ⚠️ Rate Limits

### Free Models:

- **Rate Limit**: ~20 requests/minute per model
- **Daily Limit**: Varies by model
- **Concurrent**: 2-3 requests at once

### Tips to Avoid Limits:

1. **Use multiple free models** - Rotate between them
2. **Implement caching** - Reduce duplicate requests
3. **Add delays** - Space out requests
4. **Use Groq as primary** - OpenRouter as backup

---

## 🔧 Troubleshooting

### Error: "Rate limit exceeded"

**Solution**: 
- Wait 60 seconds
- Switch to different free model
- Use Groq as primary

### Error: "Invalid API key"

**Solution**:
- Check key starts with `sk-or-v1-`
- Regenerate key at https://openrouter.ai/keys
- Update in Cortex Settings

### Error: "Model not found"

**Solution**:
- Check model name includes `:free` suffix
- Visit https://openrouter.ai/models?free=true
- Verify model is still available

---

## 🎓 Best Practices

### 1. Start with Free Models

```yaml
# Begin with all free
model_list:
  - model_name: chat
    litellm_params:
      model: openrouter/meta-llama/llama-3.2-3b-instruct:free
```

### 2. Add Paid Models as Needed

```yaml
# Add paid for specific use cases
model_list:
  - model_name: premium
    litellm_params:
      model: openrouter/anthropic/claude-3.5-sonnet
      # Only used when needed
```

### 3. Monitor Costs

- Check OpenRouter dashboard daily
- Set up budget alerts
- Use Cortex analytics

### 4. Optimize Model Selection

- Simple queries → 3B models
- General tasks → 7B models
- Complex reasoning → 405B model
- Code generation → Specialized models

---

## 🔗 Useful Links

- **OpenRouter Dashboard**: https://openrouter.ai
- **Free Models**: https://openrouter.ai/models?free=true
- **API Keys**: https://openrouter.ai/keys
- **Usage**: https://openrouter.ai/activity
- **Docs**: https://openrouter.ai/docs
- **Discord**: https://discord.gg/openrouter

---

## 📞 Support

- **OpenRouter Discord**: Best for quick help
- **Documentation**: https://openrouter.ai/docs
- **Email**: support@openrouter.ai

---

## ✅ Quick Checklist

- [ ] Sign up at OpenRouter.ai
- [ ] Get API key
- [ ] Add to Cortex Settings
- [ ] Update config.yaml
- [ ] Test with free model
- [ ] Monitor usage
- [ ] Enjoy 100+ models with one key!

---

**Updated**: December 2025  
**Status**: Verified working with Cortex
