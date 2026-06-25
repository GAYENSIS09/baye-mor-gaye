#!/bin/sh
set -e

# Ensure cache directories exist and are writable by php-fpm (www user)
mkdir -p /var/www/bootstrap/cache /var/www/storage/framework/cache/data
chown -R www:www /var/www/storage/framework/cache

# Wait for database to be ready
echo "Waiting for database..."
until php -r "new PDO('mysql:host=db;dbname=portfolio', 'portfolio', 'portfolio');" 2>/dev/null; do
    sleep 2
done
echo "Database is ready!"

# Run pending migrations only (data preserved)
php artisan migrate --force 2>/dev/null || php artisan migrate --force

# Create storage symlink
php artisan storage:link 2>/dev/null || true

# Optimize Laravel (rebuild cache on each start) — after migrations, so DB cache table exists
php artisan optimize 2>/dev/null || {
    php artisan config:clear
    php artisan config:cache
    php artisan route:cache
    php artisan event:cache
}

# Start queue worker in background (processes queued mail)
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &
echo "Queue worker started."

# Start scheduler daemon in background (runs rappels:envoyer, evenements:notifier, etc.)
php artisan schedule:work &
echo "Scheduler started."

echo "========================================"
echo "  Portfolio backend ready!"
echo "========================================"

exec "$@"
