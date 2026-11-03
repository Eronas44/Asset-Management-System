FROM php:8.3-fpm-alpine

# Instal ekstensi Linux dan PHP penunjang MySQL & Zip
RUN apk add --no-cache \
    mariadb-client \
    mysql-client \
    libzip-dev \
    zip \
    unzip \
    git \
    bash

# Ekstensi PHP: pdo_mysql untuk koneksi MySQL, zip untuk backup/restore, opcache untuk performa tinggi
RUN docker-php-ext-install pdo pdo_mysql zip opcache

# Konfigurasi PHP dan OPcache
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini
COPY docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Ambil Composer resmi
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/asset-management-api

COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Set Hak Akses Linux
RUN chown -R www-data:www-data /var/www/asset-management-api

ENTRYPOINT ["start.sh"]
CMD ["php-fpm"]
