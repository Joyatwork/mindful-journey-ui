FROM php:8.2-fpm

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    mysql-client \
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
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers du projet
COPY . /app

# Installer les dépendances PHP
RUN cd backend/mindful-journey-back && composer install --no-dev --optimize-autoloader

# Exposition du port
EXPOSE 8081

# Commande de démarrage
CMD cd backend/mindful-journey-back && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=8081
