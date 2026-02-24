FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    composer

WORKDIR /app

COPY . .

RUN cd backend/mindful-journey-back && composer install --no-dev --optimize-autoloader

EXPOSE 8081

CMD ["sh", "-c", "cd backend/mindful-journey-back && php artisan serve --host=0.0.0.0 --port=8081"]
