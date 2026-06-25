FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    linux-headers \
    $PHPIZE_DEPS \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        opcache \
        bcmath \
        pcntl

COPY docker/backend/conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/backend/conf.d/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

COPY docker/backend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/backend/nginx/default.conf /etc/nginx/http.d/default.conf

COPY docker/backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY docker/backend/php-fpm.d/www.conf /usr/local/etc/php-fpm.d/www.conf

WORKDIR /app

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY 01-portfolio-laravel/composer.json 01-portfolio-laravel/composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-autoloader

COPY 01-portfolio-laravel/ .

RUN composer dump-autoload --optimize --no-dev \
    && php artisan package:discover --ansi

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

RUN php artisan storage:link

RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]