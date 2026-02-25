#!/bin/sh
# Do NOT use set -e: if migrate fails we still want to start the server
# Build timestamp: 2026-02-25T03:00:00Z (force rebuild)

echo "==> Clearing old config cache..."
php artisan config:clear || echo "[WARN] config:clear failed"

echo "==> Caching config..."
php artisan config:cache || echo "[WARN] config:cache failed"

echo "==> Caching routes..."
php artisan route:cache || echo "[WARN] route:cache failed"

echo "==> Running migrations..."
php artisan migrate --force 2>&1 || echo "[WARN] migrate failed, continuing..."

echo "==> Starting server on port ${PORT:-8081}..."
exec php -S 0.0.0.0:"${PORT:-8081}" server.php
