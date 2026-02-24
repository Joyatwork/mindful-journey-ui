FROM php:8.2-fpm

# Installer les dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    zip \
    unzip && \
    rm -rf /var/lib/apt/lists/*

# Installer les extensions PHP
RUN docker-php-ext-install -j$(nproc) \
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

# Installer les dépendances et préparer l'app
RUN cd backend/mindful-journey-back && \
    composer install --no-dev --optimize-autoloader

EXPOSE 8081

# Démarrer PHP en mode serveur intégré
CMD cd backend/mindful-journey-back && php -S 0.0.0.0:8081 public/index.php
