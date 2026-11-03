#!/bin/bash
set -e

cd /var/www/asset-management-api

echo "[start.sh] Menunggu MySQL siap..."
until mariadb --skip-ssl -h "${DB_HOST:-db}" -P "${DB_PORT:-3306}" -u "${DB_USERNAME:-asset_user}" -p"${DB_PASSWORD:-asset_secret}" -e "SELECT 1;" >/dev/null 2>&1; do
  echo "[start.sh] MySQL belum siap, mencoba lagi dalam 3 detik..."
  sleep 3
done
echo "[start.sh] MySQL siap."

if [ ! -f vendor/autoload.php ]; then
  echo "[start.sh] Menjalankan composer install..."
  composer install --no-interaction --optimize-autoloader
fi

# Cek apakah APP_KEY sudah ada di .env atau variabel env
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null && [ -z "$APP_KEY" ]; then
  echo "[start.sh] Generate APP_KEY..."
  php artisan key:generate --force
fi

echo "[start.sh] Menjalankan migrasi database..."
php artisan migrate --force

echo "[start.sh] Optimasi cache framework..."
php artisan optimize:clear || true
php artisan optimize || true

# Pastikan folder writable
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "[start.sh] Selesai. Menjalankan: $@"
exec "$@"
