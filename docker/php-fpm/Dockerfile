# ============================================================
# BASE: Production-ready PHP-FPM
# ============================================================
FROM php:8.3-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    linux-headers \
    poppler-utils \
    $PHPIZE_DEPS \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        opcache \
        bcmath \
        pcntl

# OPCache configuration (production)
COPY docker/php-fpm/conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php-fpm/conf.d/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# PHP-FPM pool config
COPY docker/php-fpm/php-fpm.d/www.conf /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www

# ============================================================
# PRODUCTION TARGET
# ============================================================
FROM base AS production

# Copy composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install deps (no dev, optimized)
COPY 01-portfolio-laravel/composer.json 01-portfolio-laravel/composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-autoloader

# Copy application
COPY 01-portfolio-laravel/ .

# Ensure bootstrap/cache exists
RUN mkdir -p /var/www/bootstrap/cache

# Finish composer
RUN composer dump-autoload --optimize --no-dev \
    && php artisan package:discover --ansi

# Storage link
RUN php artisan storage:link

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Copy entrypoint script
COPY docker/php-fpm/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER www-data

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]

# ============================================================
# DEVELOPMENT TARGET (extends production)
# ============================================================
FROM production AS development

USER root

# Install Xdebug
ARG XDEBUG_ENABLED=true
RUN if [ "${XDEBUG_ENABLED}" = "true" ]; then \
    pecl install xdebug && \
    docker-php-ext-enable xdebug && \
    echo "xdebug.mode=develop,coverage,debug,profile" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.idekey=DOCKER" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.start_with_request=trigger" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.discover_client_host=0" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini ; \
fi

# Sync UID/GID with host
ARG UID=1000
ARG GID=1000
RUN apk add --no-cache shadow && \
    if getent group ${GID}; then \
      group_name=$(getent group ${GID} | cut -d: -f1); \
      useradd -m -u ${UID} -g ${GID} -s /bin/bash www; \
    else \
      groupadd -g ${GID} www && \
      useradd -m -u ${UID} -g www -s /bin/bash www; \
      group_name=www; \
    fi && \
    sed -i "s/user = www-data/user = www/g" /usr/local/etc/php-fpm.d/www.conf && \
    sed -i "s/group = www-data/group = $group_name/g" /usr/local/etc/php-fpm.d/www.conf

CMD ["php-fpm"]