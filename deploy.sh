#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/app"
cd "$APP_DIR"

echo "== Deploy started at $(date) =="

# 1) Docker Compose
if [ -f "docker-compose.yml" ] || [ -f "compose.yml" ]; then
  echo "Detected Docker Compose"
  docker compose up -d --build
  echo "== Deploy done (docker compose) =="
  exit 0
fi

# 2) Node.js (npm)
if [ -f "package.json" ]; then
  echo "Detected Node.js project"
  if command -v npm >/dev/null 2>&1; then
    npm ci || npm install
    if npm run | grep -q " build"; then npm run build; fi
    if command -v pm2 >/dev/null 2>&1; then
      pm2 restart app || pm2 start npm --name app -- start
    else
      echo "PM2 not found. Consider installing pm2 or using systemd."
    fi
    echo "== Deploy done (node) =="
    exit 0
  else
    echo "npm not found on server"
    exit 1
  fi
fi

# 3) Python (pip)
if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  echo "Detected Python project"
  python3 -m venv .venv || true
  source .venv/bin/activate
  if [ -f "requirements.txt" ]; then pip install -r requirements.txt; fi
  echo "Restart your service via systemd (recommended)."
  echo "== Deploy done (python deps installed) =="
  exit 0
fi

echo "I don't know how to deploy this project (no docker-compose.yml / package.json / requirements.txt)."
exit 1
