#!/bin/bash
# Render start script for Cortex V2

echo "🚀 Starting Cortex V2 server..."

# Start the FastAPI server
exec uvicorn cortex.main:app --host 0.0.0.0 --port $PORT