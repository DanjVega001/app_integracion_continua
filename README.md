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
| `nginx` | Dockerfile propio (`Dockerfile.nginx`, base `nginx:1.27-alpine`) | Servidor web, expone el puerto 80 |

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



## (GitHub Actions)

El proyecto cuenta con un pipeline de integración continua
implementado mediante GitHub Actions.

Este pipeline se ejecuta automáticamente cuando se realizan
cambios (push) en la rama main o cuando se crea un pull request.

Durante su ejecución se realizan las siguientes tareas:

- Descarga del código fuente.
- Configuración del entorno Docker.
- Validación de Docker Compose.
- Descarga de las imágenes oficiales de MySQL y Nginx.
- Construcción de la imagen personalizada de PHP.

El objetivo es verificar automáticamente que los servicios
mantengan una configuración válida y que sus imágenes
puedan construirse correctamente.

## Pipeline de Jenkins (Jenkinsfile)

El `Jenkinsfile` de la raíz define el pipeline como código. Jenkins lo ejecuta en cada push a `main` (Poll SCM, configurado en `jenkins/jenkins.yaml`).

| Etapa | Qué hace |
|---|---|
| **Checkout** | Descarga el commit desde GitHub y muestra autor y mensaje. |
| **Build** | Valida el compose y construye las imágenes de los dos servicios propios: `taskflow-php:<build>` (`Dockerfile`) y `taskflow-nginx:<build>` (`Dockerfile.nginx`). |
| **Test** | 1) `php -l` sobre todos los `.php` de la imagen. 2) Levanta el compose y espera a que `db` esté healthy. 3) `nginx` obtiene la página desde `php` por nombre de servicio. 4) `php` se conecta a `db` por nombre de servicio. 5) Llama a la API de punta a punta. Si algo falla, el build falla. |
| **post** | `failure`: muestra los logs de los contenedores. `fixed`: avisa que el pipeline volvió a verde. `cleanup`: apaga el entorno de prueba (`down -v`) y borra el `.env` temporal. |

En CI se agrega `docker-compose.ci.yml`, que quita los volúmenes, los puertos y los nombres fijos. Así se prueban las imágenes construidas y cada build corre aislado en su propio proyecto (`taskflow-ci-<build>`).

Para ejecutar las mismas pruebas en local:

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.ci.yml build php nginx
docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d --wait
docker compose -f docker-compose.yml -f docker-compose.ci.yml exec -T nginx wget -qO- "http://localhost/api.php?action=list"
docker compose -f docker-compose.yml -f docker-compose.ci.yml down -v
```
