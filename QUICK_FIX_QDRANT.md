# Quick Fix: Qdrant Not Running

## The Issue

The Playground (and chat endpoint) is failing because **Qdrant** (vector database) is not running. Cortex tries to connect to Qdrant for memory management.

Error in backend logs:
```
ResponseHandlingException: [WinError 10061] No connection could be made because the target machine actively refused it
```

## Quick Solution: Start Qdrant with Docker

### Option 1: Docker (Recommended)

```bash
# Start Qdrant
docker run -d -p 6333:6333 qdrant/qdrant

# Verify it's running
curl http://localhost:6333/health
# Should return: {"title":"qdrant - vector search engine","version":"..."}
```

### Option 2: Docker Compose

If you have `docker-compose.monitoring.yaml`:

```bash
# Start all services (Qdrant, Prometheus, Grafana)
docker-compose -f docker-compose.monitoring.yaml up -d qdrant

# Or start everything
docker-compose -f docker-compose.monitoring.yaml up -d
```

### Option 3: Disable Memory (Temporary Workaround)

If you don't need memory features for testing, you can temporarily disable Qdrant:

1. **Comment out memory retrieval** in `cortex/pipeline.py`:

```python
# Around line 70-75, comment out:
# memories = await memory_manager.retrieve_context(
#     user_id=user_id,
#     query=messages[-1]["content"]
# )
memories = []  # Disable memory for now
```

2. **Restart backend** (it will auto-reload)

## After Starting Qdrant

1. **Wait 5 seconds** for Qdrant to initialize
2. **Test the endpoint**:
   ```bash
   curl http://localhost:6333/health
   ```
3. **Try the Playground again**
4. **Should work now!** ✅

## Verify Everything is Working

```bash
# 1. Check Qdrant
curl http://localhost:6333/health

# 2. Check Backend
curl http://localhost:8080/health

# 3. Check Admin UI
# Open http://localhost:3000/playground
```

## Full Development Setup

For complete functionality, you need:

1. **Backend** (port 8080):
   ```bash
   python -m uvicorn cortex.main:app --reload --port 8080
   ```

2. **Qdrant** (port 6333):
   ```bash
   docker run -d -p 6333:6333 qdrant/qdrant
   ```

3. **Redis** (port 6379) - Optional:
   ```bash
   docker run -d -p 6379:6379 redis
   ```

4. **Admin UI** (port 3000):
   ```bash
   cd admin-ui
   npm run dev
   ```

## Summary

**Problem**: Qdrant vector database not running

**Quick Fix**: 
```bash
docker run -d -p 6333:6333 qdrant/qdrant
```

**Then**: Refresh Playground and try again!
