FROM php:8.2-fpm

ENV APP_ENV=dev

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libicu-dev \
        libpq-dev \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        libssl-dev \
        pkg-config \
    && docker-php-ext-install \
        intl \
        opcache \
        pdo_mysql \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /srv/app

COPY composer.json ./
RUN composer install --prefer-dist --no-progress --no-suggest --no-scripts --no-autoloader || true

COPY . .

RUN composer dump-autoload --optimize || true

EXPOSE 8000

CMD ["php", "-d", "variables_order=EGPCS", "-S", "0.0.0.0:8000", "-t", "public"]
