#!/bin/sh
set -e

echo "==> Caching config & routes..."
php artisan config:cache
php artisan route:cache

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Starting server on port ${PORT:-8081}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8081}"
