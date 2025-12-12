# Cortex AI Router - Quick Start Guide

Get Cortex up and running in 5 minutes.

---

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- API keys for AI providers (OpenAI, Groq, DeepSeek, etc.)

---

## Step 1: Backend Setup

### 1.1 Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 1.2 Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your keys
# Required:
KIRIO_CORTEX_MASTER_KEY=your-secure-master-key-here

# At least one AI provider:
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
DEEPSEEK_API_KEY=...
```

### 1.3 Start the Backend

```bash
python -m uvicorn cortex.main:app --reload --port 8080
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8080
INFO:     Application startup complete.
```

---

## Step 2: Admin UI Setup

### 2.1 Install Node Dependencies

```bash
cd admin-ui
npm install
```

### 2.2 Start the UI

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
```

---

## Step 3: Access the Dashboard

1. Open your browser to `http://localhost:3000`
2. Enter your master key (from `.env`)
3. Click "Login"

You're in! 🎉

---

## Step 4: Generate Your First API Key

1. Click "API Keys" in the sidebar
2. Click "Generate Key"
3. Enter a name (e.g., "Test Key")
4. Optionally add a user ID
5. Click "Generate"
6. **Copy the key immediately** (you won't see it again!)

---

## Step 5: Make Your First Request

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [
      {"role": "user", "content": "Hello! What can you do?"}
    ]
  }'
```

Replace `ctx_YOUR_KEY_HERE` with the key you just generated.

---

## What's Next?

### Explore the Dashboard
- **Dashboard**: Monitor system health
- **API Keys**: Manage access keys
- **Models**: View configured AI models
- **Metrics**: See live Prometheus metrics

### Test Different Features

#### Automatic Model Selection
```bash
# Simple chat → Uses fast model (Groq Llama)
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hi there!"}]
  }'

# Code generation → Uses DeepSeek Coder
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Write a Python function to sort a list"}]
  }'

# Complex reasoning → Uses GPT-4
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Explain quantum entanglement"}]
  }'
```

#### PII Redaction
```bash
# PII is automatically redacted before sending to AI
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{
      "role": "user",
      "content": "My email is john@example.com and SSN is 123-45-6789"
    }]
  }'
```

#### Sentiment Circuit Breaker
```bash
# High distress automatically routes to best model
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{
      "role": "user",
      "content": "I am extremely frustrated and need urgent help!"
    }]
  }'
```

### View Metrics

Open `http://localhost:8080/metrics` to see Prometheus metrics, or view them in the Admin UI.

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Verify `.env` file exists with required keys
- Check port 8080 is not in use

### Admin UI won't start
- Check Node version: `node --version` (need 18+)
- Run `npm install` in `admin-ui` folder
- Check port 3000 is not in use

### Authentication fails
- Verify master key in `.env` matches what you're entering
- Check Authorization header format: `Bearer <key>`
- For user keys, ensure they start with `ctx_`

### No AI response
- Verify at least one AI provider API key is set in `.env`
- Check `config.yaml` has correct model configurations
- View backend logs for error messages

---

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│  (Port 3000)│
└──────┬──────┘
       │
       │ HTTP
       │
┌──────▼──────────────────────────────────────┐
│         Cortex Backend (Port 8080)          │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  1. Auth Middleware                    │ │
│  │     - Validates API key                │ │
│  └────────────────────────────────────────┘ │
│                    │                         │
│  ┌────────────────▼──────────────────────┐ │
│  │  2. Request Pipeline                   │ │
│  │     - PII Redaction                    │ │
│  │     - Sentiment Analysis               │ │
│  │     - Semantic Routing                 │ │
│  │     - Memory Retrieval                 │ │
│  └────────────────────────────────────────┘ │
│                    │                         │
│  ┌────────────────▼──────────────────────┐ │
│  │  3. LiteLLM Executor                   │ │
│  │     - Calls AI model                   │ │
│  │     - Handles fallbacks                │ │
│  └────────────────────────────────────────┘ │
│                    │                         │
│  ┌────────────────▼──────────────────────┐ │
│  │  4. Response Processing                │ │
│  │     - PII Restoration                  │ │
│  │     - Memory Storage                   │ │
│  │     - Metrics Recording                │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
                    │
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼────┐           ┌─────▼─────┐
   │   AI    │           │  Storage  │
   │ Models  │           │  (SQLite, │
   │         │           │   Redis,  │
   │ OpenAI  │           │  Qdrant)  │
   │  Groq   │           └───────────┘
   │DeepSeek │
   └─────────┘
```

---

## Next Steps

1. **Read the Documentation**
   - `PHASE1_COMPLETE.md` - Core backend features
   - `PHASE2_COMPLETE.md` - Admin API and key management
   - `PHASE3_COMPLETE.md` - Observability and metrics
   - `PHASE4_COMPLETE.md` - Admin UI features

2. **Explore Advanced Features**
   - User DNA profiles for personalization
   - Memory system for context retention
   - Predictive prefetching for workflows

3. **Deploy to Production**
   - See `DEPLOYMENT.md` for Cloud Run deployment
   - Configure PostgreSQL, Redis, and Qdrant
   - Set up monitoring and alerts

4. **Integrate with Your App**
   - Use OpenAI-compatible SDK
   - Point to `http://your-cortex-url/v1/chat/completions`
   - Use your generated API key

---

## Support

- Check `SESSION_HANDOFF.md` for detailed system overview
- Review test files for usage examples
- Check backend logs for debugging

---

**You're all set!** Cortex is now routing your AI requests intelligently. 🚀
