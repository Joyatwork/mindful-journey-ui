FROM php:8.2-cli

# Installer les dépendances système minimales
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Installer les extensions PHP nécessaires
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    curl \
    json \
    bcmath \
    tokenizer \
    xml \
    ctype

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers du projet
COPY . /app

# Installer les dépendances PHP
RUN cd backend/mindful-journey-back && composer install --no-dev --optimize-autoloader

# Exposition du port
EXPOSE 8081

# Commande de démarrage
CMD cd backend/mindful-journey-back && php artisan config:cache && php artisan route:cache && php -S 0.0.0.0:8081 public/index.php
