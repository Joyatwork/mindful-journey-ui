FROM php:8.2-alpine

# Installer les dépendances système et de compilation
RUN apk add --no-cache \
    git \
    curl \
    zip \
    unzip \
    autoconf \
    g++ \
    gcc \
    make \
    libc-dev \
    oniguruma-dev \
    openssl-dev

# Installer les extensions PHP
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    json \
    bcmath \
    tokenizer \
    xml \
    ctype

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . /app

# Installer les dépendances PHP avec Composer
RUN cd backend/mindful-journey-back && \
    composer install --no-dev --optimize-autoloader && \
    php artisan config:cache && \
    php artisan route:cache

EXPOSE 8081

CMD ["sh", "-c", "cd backend/mindful-journey-back && php -S 0.0.0.0:8081 public/index.php"]
