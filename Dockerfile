FROM php:8.2-cli-alpine

RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    composer \
    gnu-libiconv-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libressl-dev \
    mysql-client

RUN docker-php-ext-install \
    pdo_mysql \
    fileinfo \
    gd \
    intl \
    opcache

WORKDIR /app

COPY . .

RUN cd backend/mindful-journey-back && composer install --no-dev --optimize-autoloader

RUN cd backend/mindful-journey-back && php artisan config:cache && php artisan route:cache

EXPOSE 8081

CMD ["sh", "-c", "cd backend/mindful-journey-back && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8081"]
