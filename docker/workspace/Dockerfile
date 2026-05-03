FROM php:8.3-cli-alpine

ARG UID=1000
ARG GID=1000

# System deps + PHP extensions (no node - frontend has its own container)
RUN apk add --no-cache \
    curl \
    unzip \
    git \
    bash \
    linux-headers \
    $PHPIZE_DEPS \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        bcmath \
        pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && apk del $PHPIZE_DEPS linux-headers \
    && rm -rf /var/cache/apk/*

# Sync UID/GID
RUN apk add --no-cache shadow && \
    if getent group ${GID}; then \
      useradd -m -u ${UID} -g ${GID} -s /bin/bash www; \
    else \
      groupadd -g ${GID} www && \
      useradd -m -u ${UID} -g www -s /bin/bash www; \
    fi

USER www
WORKDIR /var/www

ENTRYPOINT []
CMD ["bash"]