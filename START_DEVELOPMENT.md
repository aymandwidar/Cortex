# Start Development Environment

Quick guide to start all Cortex services for development.

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional, for monitoring)

---

## Step 1: Start Backend

Open a terminal and run:

```bash
# Set environment variables (create .env first if you haven't)
# Copy .env.example to .env and fill in your API keys

# Start the backend
python -m uvicorn cortex.main:app --reload --port 8080
```

**Expected output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test it**:
```bash
curl http://localhost:8080/health
# Should return: {"status":"healthy","service":"cortex"}
```

---

## Step 2: Start Admin UI

Open a **new terminal** and run:

```bash
cd admin-ui
npm run dev
```

**Expected output**:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Access it**:
- Open http://localhost:3000 in your browser
- Login with your master key from `.env`

---

## Step 3: Start Monitoring (Optional)

Open a **third terminal** and run:

```bash
docker-compose -f docker-compose.monitoring.yaml up -d
```

**Access monitoring**:
- Grafana: http://localhost:3001 (admin/cortex-admin)
- Prometheus: http://localhost:9090
- AlertManager: http://localhost:9093

---

## Quick Start Script

Create a file `start-dev.sh`:

```bash
#!/bin/bash

# Start backend in background
echo "Starting backend..."
python -m uvicorn cortex.main:app --reload --port 8080 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start admin UI in background
echo "Starting Admin UI..."
cd admin-ui
npm run dev &
UI_PID=$!

# Start monitoring (optional)
echo "Starting monitoring stack..."
docker-compose -f ../docker-compose.monitoring.yaml up -d

echo ""
echo "✅ All services started!"
echo ""
echo "Backend: http://localhost:8080"
echo "Admin UI: http://localhost:3000"
echo "Grafana: http://localhost:3001"
echo "Prometheus: http://localhost:9090"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $UI_PID; docker-compose -f docker-compose.monitoring.yaml down; exit" INT
wait
```

Make it executable:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

## Troubleshooting

### Backend won't start

**Error**: `ModuleNotFoundError: No module named 'cortex'`
```bash
# Install dependencies
pip install -r requirements.txt
```

**Error**: `KeyError: 'KIRIO_CORTEX_MASTER_KEY'`
```bash
# Create .env file
cp .env.example .env
# Edit .env and add your keys
```

### Admin UI shows proxy errors

**Error**: `[vite] http proxy error: /health ECONNREFUSED`

**Solution**: Start the backend first!
```bash
# In terminal 1
python -m uvicorn cortex.main:app --reload --port 8080

# Wait for "Application startup complete"
# Then in terminal 2
cd admin-ui && npm run dev
```

### Port already in use

**Error**: `Address already in use`

**Solution**: Kill the process using the port
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

---

## Development Workflow

### 1. Make Changes

**Backend changes**:
- Edit files in `cortex/`
- Uvicorn auto-reloads on save
- Check terminal for errors

**Frontend changes**:
- Edit files in `admin-ui/src/`
- Vite HMR updates instantly
- Check browser console for errors

### 2. Test Changes

**Backend**:
```bash
# Run tests
pytest tests/

# Test specific endpoint
curl http://localhost:8080/health
```

**Frontend**:
```bash
# Build to check for errors
cd admin-ui
npm run build
```

### 3. View Logs

**Backend logs**: Check terminal running uvicorn

**Frontend logs**: Check browser console (F12)

**Monitoring logs**:
```bash
docker-compose -f docker-compose.monitoring.yaml logs -f
```

---

## Stop Services

### Stop Backend
Press `Ctrl+C` in the backend terminal

### Stop Admin UI
Press `Ctrl+C` in the UI terminal

### Stop Monitoring
```bash
docker-compose -f docker-compose.monitoring.yaml down
```

### Stop All (if using start-dev.sh)
Press `Ctrl+C` once - it will stop everything

---

## Environment Variables

Create `.env` file in project root:

```bash
# Required
KIRIO_CORTEX_MASTER_KEY=your-secure-master-key-here

# At least one AI provider
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
DEEPSEEK_API_KEY=...

# Optional
ANTHROPIC_API_KEY=...
DATABASE_URL=sqlite+aiosqlite:///./cortex.db
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
LOG_LEVEL=INFO
```

---

## Quick Commands Reference

```bash
# Backend
python -m uvicorn cortex.main:app --reload --port 8080

# Admin UI
cd admin-ui && npm run dev

# Monitoring
docker-compose -f docker-compose.monitoring.yaml up -d

# Tests
pytest tests/

# Build UI for production
cd admin-ui && npm run build

# Check backend health
curl http://localhost:8080/health

# View metrics
curl http://localhost:8080/metrics
```

---

## What's Running Where

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:8080 | Main Cortex API |
| Admin UI | http://localhost:3000 | Web dashboard |
| Grafana | http://localhost:3001 | Monitoring dashboards |
| Prometheus | http://localhost:9090 | Metrics collection |
| AlertManager | http://localhost:9093 | Alert management |

---

## Next Steps

1. ✅ Start backend
2. ✅ Start Admin UI
3. ✅ Login to dashboard
4. ✅ Generate API key
5. ✅ Test chat completion
6. ✅ View metrics
7. ✅ Check Grafana dashboards

---

**Happy developing! 🚀**
