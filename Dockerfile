FROM php:8.2-cli-alpine

# ── system packages ──────────────────────────────────────────────
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    icu-dev \
    icu-libs \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    openssl-dev \
    oniguruma-dev \
    linux-headers \
    mysql-client \
    ca-certificates

# ── PHP extensions ───────────────────────────────────────────────
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    fileinfo \
    gd \
    intl \
    opcache \
    mbstring \
    bcmath

# ── Composer ─────────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# copy only composer files first for layer caching
COPY backend/mindful-journey-back/composer.json backend/mindful-journey-back/composer.lock* backend/mindful-journey-back/
RUN cd backend/mindful-journey-back && composer install --no-dev --optimize-autoloader --no-scripts

# copy the rest of the backend code
COPY backend/mindful-journey-back backend/mindful-journey-back

# post-install scripts (package:discover, etc.)
RUN cd backend/mindful-journey-back && composer run-script post-autoload-dump --no-interaction || true

# ensure storage & cache directories exist and are writable
RUN cd backend/mindful-journey-back \
 && mkdir -p storage/framework/{sessions,views,cache} storage/logs storage/app/public/avatars bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

# ── SSL for Aiven MySQL ─────────────────────────────────────────
# Aiven uses publicly-trusted CAs; the system bundle works

# ── Set final working directory to the Laravel project ───────────
WORKDIR /app/backend/mindful-journey-back

# ── SSL for Aiven MySQL ─────────────────────────────────────────
ENV MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt

# ── Entrypoint script ───────────────────────────────────────────
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE ${PORT:-8081}

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
