# Cortex API Documentation

## Base URL

**Development**: `http://localhost:8080`  
**Production**: `https://your-domain.com`

## Authentication

All API requests require authentication using an API key in the Authorization header:

```
Authorization: Bearer ctx_your_api_key_here
```

### API Key Types

1. **User API Keys** (starts with `ctx_`)
   - For application access
   - Limited permissions
   - Can be revoked

2. **Master Key** (admin only)
   - Full admin access
   - Manage settings and keys
   - Should never be exposed

## Endpoints

### 1. Chat Completions (OpenAI Compatible)

Create a chat completion.

**Endpoint**: `POST /v1/chat/completions`

**Headers**:
```
Authorization: Bearer ctx_your_key
Content-Type: application/json
```

**Request Body**:
```json
{
  "model": "reflex-model",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "user": "user-123"
}
```

**Parameters**:
- `model` (required): Model to use
  - `reflex-model`: Fast chat (Groq Llama 8B)
  - `analyst-model`: Code & analysis (Groq Llama 70B)
  - `genius-model`: Complex reasoning (Gemini Pro)
- `messages` (required): Array of message objects
- `temperature` (optional): 0.0 to 2.0, default 0.7
- `max_tokens` (optional): Maximum tokens to generate
- `user` (optional): User identifier for tracking

**Response**:
```json
{
  "id": "chatcmpl-123",
  "model": "llama-3.1-8b-instant",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

**Example (Python)**:
```python
import requests

response = requests.post(
    "http://localhost:8080/v1/chat/completions",
    headers={
        "Authorization": "Bearer ctx_your_key",
        "Content-Type": "application/json"
    },
    json={
        "model": "reflex-model",
        "messages": [
            {"role": "user", "content": "What is AI?"}
        ]
    }
)

data = response.json()
print(data["choices"][0]["message"]["content"])
```

**Example (JavaScript)**:
```javascript
const response = await fetch("http://localhost:8080/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ctx_your_key",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "reflex-model",
    messages: [
      { role: "user", content: "What is AI?" }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

**Example (cURL)**:
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer ctx_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "reflex-model",
    "messages": [
      {"role": "user", "content": "What is AI?"}
    ]
  }'
```

### 2. Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "cortex"
}
```

### 3. Readiness Check

Check if all dependencies are ready.

**Endpoint**: `GET /health/ready`

**Response**:
```json
{
  "status": "ready",
  "service": "cortex",
  "dependencies": {}
}
```

## Admin Endpoints

Require master key authentication.

### 1. Generate API Key

Create a new API key for users.

**Endpoint**: `POST /admin/v1/generate_key`

**Headers**:
```
Authorization: Bearer your-master-key
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "My App",
  "user_id": "user-123",
  "metadata": {
    "app": "mobile",
    "environment": "production"
  }
}
```

**Response**:
```json
{
  "key": "ctx_abc123...",
  "user_id": "user-123",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 2. List API Keys

Get all API keys.

**Endpoint**: `GET /admin/v1/keys`

**Headers**:
```
Authorization: Bearer your-master-key
```

**Response**:
```json
{
  "keys": [
    {
      "key_id": "key_123",
      "name": "My App",
      "user_id": "user-123",
      "created_at": "2024-01-01T00:00:00Z",
      "is_active": true
    }
  ]
}
```

### 3. Revoke API Key

Revoke an API key.

**Endpoint**: `DELETE /admin/v1/keys/{key_id}`

**Headers**:
```
Authorization: Bearer your-master-key
```

**Response**:
```json
{
  "message": "Key revoked successfully"
}
```

### 4. Add Provider Settings

Add or update provider API keys.

**Endpoint**: `POST /admin/v1/settings/providers`

**Headers**:
```
Authorization: Bearer your-master-key
Content-Type: application/json
```

**Request Body**:
```json
{
  "provider_name": "groq",
  "api_key": "gsk_your_key_here",
  "provider_config": {
    "max_requests_per_minute": 60
  },
  "is_active": true
}
```

**Response**:
```json
{
  "provider_name": "groq",
  "api_key_preview": "...key_here",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 5. List Providers

Get all configured providers.

**Endpoint**: `GET /admin/v1/settings/providers`

**Headers**:
```
Authorization: Bearer your-master-key
```

**Response**:
```json
[
  {
    "provider_name": "groq",
    "api_key_preview": "...3D1C",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 6. Get Analytics

Get usage analytics.

**Endpoint**: `GET /admin/v1/analytics`

**Headers**:
```
Authorization: Bearer your-master-key
```

**Query Parameters**:
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `user_id`: Filter by user (optional)

**Response**:
```json
{
  "total_requests": 1000,
  "successful_requests": 950,
  "failed_requests": 50,
  "total_tokens": 50000,
  "average_latency_ms": 250,
  "requests_by_model": {
    "reflex-model": 600,
    "analyst-model": 300,
    "genius-model": 100
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "type": "error_type",
    "code": "error_code"
  }
}
```

### Error Codes

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid or missing API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable

### Example Error:
```json
{
  "error": {
    "message": "Invalid API key provided",
    "type": "auth_error",
    "code": "invalid_api_key"
  }
}
```

## Rate Limits

Default rate limits:
- **User API Keys**: 60 requests/minute
- **Master Key**: Unlimited

Rate limit headers in response:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640000000
```

## Models

### Available Models

| Model Name | Provider | Description | Speed | Cost |
|------------|----------|-------------|-------|------|
| reflex-model | Groq | Fast chat (Llama 8B) | Very Fast | FREE |
| analyst-model | Groq | Code & analysis (Llama 70B) | Fast | FREE |
| genius-model | Google | Complex reasoning (Gemini Pro) | Moderate | FREE |

### Direct Model Access

You can also use provider models directly:
- `groq/llama-3.1-8b-instant`
- `groq/llama-3.1-70b-versatile`
- `gemini/gemini-pro`
- `gemini/gemini-pro-vision`

## Best Practices

### 1. Error Handling
Always handle errors gracefully:
```python
try:
    response = requests.post(...)
    response.raise_for_status()
    data = response.json()
except requests.exceptions.HTTPError as e:
    print(f"HTTP error: {e}")
except requests.exceptions.RequestException as e:
    print(f"Request error: {e}")
```

### 2. Retry Logic
Implement exponential backoff for retries:
```python
import time

max_retries = 3
for attempt in range(max_retries):
    try:
        response = requests.post(...)
        break
    except Exception as e:
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)
        else:
            raise
```

### 3. Timeout
Always set a timeout:
```python
response = requests.post(..., timeout=30)
```

### 4. User Identification
Include user ID for better analytics:
```json
{
  "model": "reflex-model",
  "messages": [...],
  "user": "user-123"
}
```

### 5. Token Management
Monitor token usage to control costs:
```python
data = response.json()
tokens_used = data["usage"]["total_tokens"]
print(f"Tokens used: {tokens_used}")
```

## SDK Examples

### Python (OpenAI SDK)
```python
import openai

openai.api_base = "http://localhost:8080/v1"
openai.api_key = "ctx_your_key"

response = openai.ChatCompletion.create(
    model="reflex-model",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### JavaScript (OpenAI SDK)
```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost:8080/v1",
  apiKey: "ctx_your_key"
});

const response = await openai.chat.completions.create({
  model: "reflex-model",
  messages: [
    { role: "user", content: "Hello!" }
  ]
});

console.log(response.choices[0].message.content);
```

## Support

For issues or questions:
1. Check logs: Backend console or `error_log.txt`
2. Review documentation: `PROJECT_COMPLETE.md`
3. Test with: `python final_test.py`

## Changelog

### v1.0.0 (Current)
- ✅ Multi-provider support (Groq, Google, OpenRouter)
- ✅ Settings page API key management
- ✅ OpenAI-compatible API
- ✅ Admin dashboard
- ✅ AI Playground
- ✅ Memory & context
- ✅ Analytics & monitoring
- ✅ 100% free operation
