FROM php:8.2.27-fpm

# Instalar extensiones necesarias de base de datos
RUN docker-php-ext-install pdo pdo_mysql

# Definir la ruta de trabajo estándar
WORKDIR /var/www/public

# Copiar el código fuente y asignar permisos al usuario www-data
COPY --chown=www-data:www-data ./app .

EXPOSE 9000

CMD ["php-fpm"]