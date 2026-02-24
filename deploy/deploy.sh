#!/usr/bin/env bash
# Cégverzum — Deployment script (run after code changes)
# Usage: sudo bash deploy.sh
set -euo pipefail

APP_DIR="/opt/cegverzum"

echo "=== Deploying Cégverzum ==="

# --- 1. Pull latest code ---
echo ">>> Pulling latest code..."
cd "$APP_DIR"
sudo -u cegverzum git pull origin main

# --- 2. Backend: update deps + migrate ---
echo ">>> Updating backend dependencies..."
sudo -u cegverzum "$APP_DIR/backend/venv/bin/pip" install -r "$APP_DIR/backend/requirements.txt"

echo ">>> Running database migrations..."
cd "$APP_DIR/backend"
sudo -u cegverzum "$APP_DIR/backend/venv/bin/alembic" upgrade head

# --- 3. Frontend: rebuild ---
echo ">>> Building frontend..."
cd "$APP_DIR/frontend"
sudo -u cegverzum npm ci
sudo -u cegverzum npm run build

# --- 4. Restart services ---
echo ">>> Restarting services..."
systemctl restart cegverzum-api cegverzum-celery cegverzum-celery-beat

echo ""
echo "=== Deploy complete! ==="
echo "  Check: systemctl status cegverzum-api"
echo "  Logs:  journalctl -u cegverzum-api -f"
