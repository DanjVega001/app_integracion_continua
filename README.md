# TaskFlow — App de gestión de tareas

Aplicación web CRUD de tareas construida con PHP, MySQL y Nginx, orquestada con Docker Compose.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado y corriendo
- [Docker Compose](https://docs.docker.com/compose/) (incluido en Docker Desktop)

---

## Levantar la aplicación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd app_integracion_continua

```

### 2. Crear el archivo de variables de entorno

```bash
cp .env.example .env
```

> El archivo `.env` ya viene con valores por defecto listos para usar. No es necesario modificarlo.

### 3. Construir y levantar los contenedores

```bash
docker compose up --build -d
```

Esto levanta tres servicios:
| Contenedor | Imagen | Función |
|---|---|---|
| `php` | Dockerfile propio (`php:8.2.27-fpm`) | Ejecuta la aplicación PHP |
| `db` | `mysql:8.2.0` | Base de datos MySQL |
| `nginx` | `nginx:1.27-alpine` | Servidor web, expone el puerto 80 |

### 4. Abrir la aplicación

```
http://localhost
```

---

## Detener y limpiar

```bash
# Detener los contenedores (los datos se conservan)
docker compose down

# Detener y eliminar también el volumen de la base de datos
docker compose down -v
```

---

## Comunicación entre contenedores

`nginx` recibe las peticiones HTTP en el puerto 80 y las reenvía al contenedor `php` usando su **nombre de servicio** dentro de la red `taskflow-net`:

```
fastcgi_pass php:9000;
```

`php` se conecta a la base de datos usando el nombre de servicio `db`:

```
DB_HOST=db
```

No se usa `localhost` ni IPs fijas en ningún punto.
