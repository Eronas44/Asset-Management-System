FROM php:8.3-fpm-alpine

# Instal ekstensi Linux dan PHP penunjang PostgreSQL & Zip
RUN apk add --no-cache \
    postgresql-client \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    bash

RUN docker-php-ext-install pdo pdo_pgsql zip

# Ambil Composer resmi
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/asset-management-api

# Set Hak Akses Linux
RUN chown -R www-data:www-data /var/www/asset-management-api
CMD ["php-fpm"]