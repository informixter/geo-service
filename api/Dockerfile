FROM php:7-fpm-buster

RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg wget

RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main" | tee  /etc/apt/sources.list.d/pgdg.list



RUN apt-get update && \
    apt-get install -y  \
    bash  \
    git  \
    libtool  \
    libpng-dev  \
    libpq-dev  \
    librabbitmq-dev  \
    zlib1g-dev  \
    libicu-dev  \
    libxslt-dev  \
    nano  \
    libzip-dev  \
    apt-transport-https  \
    wget \
    postgresql-client-12

RUN docker-php-ext-install -j$(nproc) intl gd bcmath zip pdo_pgsql pgsql sockets xsl soap opcache

RUN echo 'memory_limit = 1024M' >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini;

ENV COMPOSER_HOME /composer
ENV PATH ./vendor/bin:/composer/vendor/bin:$PATH
ENV COMPOSER_ALLOW_SUPERUSER 1
RUN curl -s https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin/ --filename=composer
RUN apt-get clean
RUN mkdir /app
WORKDIR /app
ADD . /app

RUN composer install
RUN chmod -R 0777 /app/storage/logs
RUN wget https://59830.selcdn.ru/cdn/exp2.csv -O /app/storage/app/
