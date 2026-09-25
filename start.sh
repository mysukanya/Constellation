#!/bin/bash
# ==============================================================================
# Constellation Intelligence Platform — Production/Development Launcher
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "========================================================"
echo "  🌐 Constellation Intelligence Platform Launcher"
echo "========================================================"

# Check or generate .env
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Ensure Python Virtualenv
if [ ! -d "backend/.venv" ]; then
    echo "Setting up Python virtual environment in backend/.venv..."
    python3 -m venv backend/.venv
    backend/.venv/bin/pip install --upgrade pip
    backend/.venv/bin/pip install -r backend/requirements.txt
fi

# Ensure Frontend Dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "✓ Environment check passed."
echo "Starting Backend on http://127.0.0.1:8000 (API & Docs: /docs)..."
PYTHONPATH="$DIR/backend" "$DIR/backend/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

cleanup() {
    echo ""
    echo "Shutting down Constellation services..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "Starting Frontend on http://localhost:5173..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

wait
