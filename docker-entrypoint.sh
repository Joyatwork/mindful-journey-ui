#!/bin/sh
# Do NOT use set -e: if migrate fails we still want to start the server
# Build timestamp: 2026-02-28T02:00:00Z (force rebuild)

echo "==> Creating storage directories..."
mkdir -p storage/app/public/avatars storage/framework/{sessions,views,cache} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Create temp directory for file uploads
mkdir -p /tmp/php-uploads
chmod 777 /tmp/php-uploads

echo "==> Creating storage symlink..."
php artisan storage:link --force 2>&1 || echo "[WARN] storage:link failed (may already exist)"

echo "==> Clearing old config cache..."
php artisan config:clear || echo "[WARN] config:clear failed"

echo "==> Caching config..."
php artisan config:cache || echo "[WARN] config:cache failed"

echo "==> Caching routes..."
php artisan route:cache || echo "[WARN] route:cache failed"

echo "==> Running migrations..."
php artisan migrate --force 2>&1 || echo "[WARN] migrate failed, continuing..."

echo "==> Starting server on port ${PORT:-8081}..."
exec php \
  -d upload_max_filesize=10M \
  -d post_max_size=12M \
  -d max_file_uploads=5 \
  -d upload_tmp_dir=/tmp/php-uploads \
  -d file_uploads=On \
  -S 0.0.0.0:"${PORT:-8081}" server.php
