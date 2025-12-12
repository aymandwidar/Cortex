# Quick Guide: Create API Key for Your App

## The UI page is blank, so let's use the script method instead!

## Step 1: Run the Script

```bash
python create_app_key.py
```

This will create an API key for your app and display it.

## Step 2: Save the Key

Copy the API key (starts with `ctx_`) - you won't see it again!

## Step 3: Use in Your App

### Example: Python App

```python
import requests

# Your Cortex API key
CORTEX_API_KEY = "ctx_your_key_here"

# Send a chat request
response = requests.post(
    "http://localhost:8080/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {CORTEX_API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "reflex-model",
        "messages": [
            {"role": "user", "content": "Hello from my app!"}
        ]
    }
)

print(response.json())
```

### Example: JavaScript/Node.js App

```javascript
const CORTEX_API_KEY = "ctx_your_key_here";

fetch("http://localhost:8080/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${CORTEX_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "reflex-model",
    messages: [
      { role: "user", content: "Hello from my app!" }
    ]
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Example: cURL (Command Line)

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "reflex-model",
    "messages": [
      {"role": "user", "content": "Hello from my app!"}
    ]
  }'
```

## What Cortex Does for Your App

When your app calls Cortex:

1. **Authentication** - Validates your API key
2. **Routing** - Selects the best AI model (Groq, OpenRouter, Google)
3. **Processing** - Handles the request through the pipeline
4. **Memory** - Remembers conversation context (optional)
5. **Response** - Returns AI response to your app

## Benefits

- ✅ **One API** - Works with multiple AI providers
- ✅ **Free** - Uses free Groq, OpenRouter, Google APIs
- ✅ **Smart Routing** - Automatically picks best model
- ✅ **Memory** - Conversation history across sessions
- ✅ **Analytics** - Track usage and performance
- ✅ **Cost Control** - Monitor and limit usage

## OpenAI Compatible

Cortex is **100% OpenAI API compatible**, so you can:
- Replace OpenAI API with Cortex
- Use existing OpenAI SDKs
- Just change the base URL and API key!

```python
# Instead of OpenAI
# openai.api_base = "https://api.openai.com/v1"
# openai.api_key = "sk-..."

# Use Cortex
openai.api_base = "http://localhost:8080/v1"
openai.api_key = "ctx_your_key_here"
```

## Next Steps

1. Run `python create_app_key.py` to get your key
2. Test it with the examples above
3. Integrate into your app
4. Monitor usage in the Dashboard
