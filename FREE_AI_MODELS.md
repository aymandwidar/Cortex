# Free AI Models Guide

Comprehensive list of free AI models you can use with Cortex.

---

## 🆓 Completely Free Models

### 1. **Groq** (Fast & Free)
**Website**: https://groq.com  
**Free Tier**: Generous free tier with high speed

**Models**:
- `llama-3.3-70b-versatile` - Best overall (70B parameters)
- `llama-3.1-70b-versatile` - Previous version
- `llama-3.1-8b-instant` - Fastest (8B parameters)
- `mixtral-8x7b-32768` - Good for long context
- `gemma2-9b-it` - Google's Gemma

**Speed**: ⚡ Extremely fast (up to 800 tokens/sec)  
**Limits**: ~14,400 requests/day free tier  
**Best For**: Production use, fast responses

---

### 2. **Hugging Face** (100% Free)
**Website**: https://huggingface.co  
**Free Tier**: Completely free, no limits

**Models** (via Inference API):
- `meta-llama/Llama-3.2-3B-Instruct` - Small but capable
- `mistralai/Mistral-7B-Instruct-v0.3` - Good quality
- `google/flan-t5-xxl` - Text generation
- `bigscience/bloom-7b1` - Multilingual

**Speed**: Moderate  
**Limits**: Rate limited but free  
**Best For**: Experimentation, development

---

### 3. **OpenRouter** (Free Models)
**Website**: https://openrouter.ai  
**Free Tier**: Many free models available

**Free Models**:
- `meta-llama/llama-3.2-3b-instruct:free` - Free Llama
- `mistralai/mistral-7b-instruct:free` - Free Mistral
- `google/gemma-2-9b-it:free` - Free Gemma
- `nousresearch/hermes-3-llama-3.1-405b:free` - Free 405B!
- `microsoft/phi-3-mini-128k-instruct:free` - Free Phi-3

**Speed**: Varies by model  
**Limits**: Rate limited  
**Best For**: Access to many models with one API key

---

### 4. **Together AI** (Free Credits)
**Website**: https://together.ai  
**Free Tier**: $25 free credits

**Models**:
- `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` - Fast Llama
- `mistralai/Mixtral-8x7B-Instruct-v0.1` - Mixtral
- `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO` - Hermes

**Speed**: Fast  
**Limits**: $25 free credits  
**Best For**: High-quality responses

---

### 5. **Perplexity** (Limited Free)
**Website**: https://perplexity.ai  
**Free Tier**: Limited free API access

**Models**:
- `llama-3.1-sonar-small-128k-online` - With web search
- `llama-3.1-sonar-large-128k-online` - Larger with search

**Speed**: Moderate  
**Limits**: Limited free tier  
**Best For**: Search-augmented responses

---

## 💰 Freemium Models (Free Tier Available)

### 6. **Google AI Studio** (Gemini)
**Website**: https://ai.google.dev  
**Free Tier**: 60 requests/minute free

**Models**:
- `gemini-1.5-flash` - Fast and free
- `gemini-1.5-pro` - More capable (limited free)

**Speed**: Fast  
**Limits**: 60 RPM free  
**Best For**: Multimodal, long context

---

### 7. **Anthropic Claude** (Limited Free)
**Website**: https://anthropic.com  
**Free Tier**: $5 free credits

**Models**:
- `claude-3-haiku-20240307` - Fastest, cheapest
- `claude-3-5-sonnet-20241022` - Best quality (uses credits fast)

**Speed**: Fast  
**Limits**: $5 free credits  
**Best For**: High-quality reasoning

---

### 8. **Cohere** (Trial Credits)
**Website**: https://cohere.com  
**Free Tier**: Trial credits

**Models**:
- `command-r` - Good for RAG
- `command-r-plus` - More capable

**Speed**: Fast  
**Limits**: Trial credits  
**Best For**: Enterprise features

---

## 🎯 Recommended Free Setup

### Best Free Combination:

1. **Primary**: Groq (llama-3.3-70b-versatile)
   - Fast, high quality, generous limits
   
2. **Backup**: OpenRouter (free models)
   - Many models, one API key
   
3. **Specialized**: Google Gemini (gemini-1.5-flash)
   - Multimodal, long context

### Configuration:

```yaml
# config.yaml
model_list:
  # Fast & Free - Groq
  - model_name: reflex-model
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
  
  # Free via OpenRouter
  - model_name: analyst-model
    litellm_params:
      model: openrouter/meta-llama/llama-3.2-3b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
  
  # Free Gemini
  - model_name: genius-model
    litellm_params:
      model: gemini/gemini-1.5-flash
      api_key: os.environ/GOOGLE_API_KEY
```

---

## 📊 Free Model Comparison

| Provider | Best Model | Speed | Quality | Limits | Multimodal |
|----------|-----------|-------|---------|--------|------------|
| **Groq** | Llama 3.3 70B | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 14K/day | ❌ |
| **OpenRouter** | Hermes 405B | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Rate limited | ❌ |
| **Gemini** | Flash 1.5 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 60 RPM | ✅ |
| **HuggingFace** | Mistral 7B | ⚡⚡ | ⭐⭐⭐ | Rate limited | ❌ |
| **Together** | Llama 3.1 70B | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $25 credits | ❌ |

---

## 🚀 Getting Started

### 1. Sign Up for Free Accounts:

**Groq** (Recommended):
```bash
# Visit: https://console.groq.com
# Sign up with email
# Get API key from dashboard
```

**OpenRouter**:
```bash
# Visit: https://openrouter.ai
# Sign up with email
# Get API key from settings
# Browse free models: https://openrouter.ai/models?free=true
```

**Google AI Studio**:
```bash
# Visit: https://ai.google.dev
# Sign in with Google account
# Get API key from dashboard
```

### 2. Add to Cortex Settings:

1. Open Admin UI: http://localhost:3000
2. Go to Settings
3. Add providers:
   - **Groq**: Add API key
   - **OpenRouter**: Add API key
   - **Google**: Add API key

### 3. Update config.yaml:

```yaml
model_list:
  - model_name: fast-free
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
  
  - model_name: smart-free
    litellm_params:
      model: openrouter/nousresearch/hermes-3-llama-3.1-405b:free
      api_key: os.environ/OPENROUTER_API_KEY
```

---

## 💡 Tips for Free Usage

### Maximize Free Tier:

1. **Use Groq for most requests** - Fastest and most generous
2. **OpenRouter for variety** - Access many models with one key
3. **Implement caching** - Reduce duplicate requests
4. **Use smaller models** - When appropriate (8B vs 70B)
5. **Batch requests** - When possible

### Avoid Rate Limits:

1. **Implement exponential backoff**
2. **Use multiple providers** - Automatic fallback
3. **Cache responses** - Redis caching
4. **Monitor usage** - Track in Analytics

### Cost Optimization:

1. **Route by complexity**:
   - Simple queries → 8B models
   - Complex queries → 70B models
   - Reasoning tasks → 405B models

2. **Use semantic routing**:
   - Cortex automatically selects best model
   - Saves costs by using appropriate model

---

## 🔗 Useful Links

- **Groq Console**: https://console.groq.com
- **OpenRouter Models**: https://openrouter.ai/models
- **Google AI Studio**: https://ai.google.dev
- **HuggingFace**: https://huggingface.co/models
- **Together AI**: https://together.ai
- **LiteLLM Docs**: https://docs.litellm.ai/docs/providers

---

## ⚠️ Important Notes

1. **Free tiers can change** - Check provider websites for current limits
2. **Rate limits apply** - Implement proper error handling
3. **Quality varies** - Test models for your use case
4. **Terms of service** - Read and comply with provider ToS
5. **Production use** - Consider paid tiers for reliability

---

## 🎓 Recommended Learning Path

1. **Start with Groq** - Easy, fast, generous
2. **Add OpenRouter** - Explore different models
3. **Try Gemini** - For multimodal needs
4. **Experiment** - Find what works for your use case
5. **Monitor** - Use Cortex analytics to track usage

---

**Updated**: December 2025  
**Status**: All providers verified and working
