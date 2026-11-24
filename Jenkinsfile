// Pipeline de Integración Continua — TaskFlow (PHP-FPM + Nginx + MySQL)
// Flujo: commit -> GitHub -> Jenkins (Poll SCM) -> Checkout -> Build -> Test -> post
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)          // el checkout se hace en su propia etapa
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        // Cada build etiqueta sus imágenes con su número: taskflow-php:15, taskflow-nginx:15
        IMAGE_TAG            = "${env.BUILD_NUMBER}"
        // Proyecto de compose aislado por build (red y contenedores propios)
        COMPOSE_PROJECT_NAME = "taskflow-ci-${env.BUILD_NUMBER}"
        COMPOSE              = 'docker compose -f docker-compose.yml -f docker-compose.ci.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --pretty=format:"Commit %h | %an | %s%n"'
            }
        }

        stage('Build') {
            steps {
                sh '''
                    # Variables de prueba para la BD temporal del build (no son secretos reales)
                    cp .env.example .env

                    docker version --format 'Docker {{.Server.Version}}'
                    $COMPOSE config --quiet

                    # Construye las imágenes de los dos servicios de la Entrega 1
                    $COMPOSE build --pull php nginx

                    docker image ls --filter "reference=taskflow-*:${IMAGE_TAG}"
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    echo "== 1. Sintaxis de todos los archivos PHP dentro de la imagen =="
                    docker run --rm "taskflow-php:${IMAGE_TAG}" \
                        sh -c 'find . -name "*.php" -print0 | xargs -0 -n1 php -l'

                    echo "== 2. Levantar el compose y esperar a que la BD esté healthy =="
                    $COMPOSE up -d --wait --wait-timeout 120
                    $COMPOSE ps

                    # Nombre de la red creada por compose para este build
                    CI_NET="${COMPOSE_PROJECT_NAME}_taskflow-net"

                    echo "== 3. nginx -> php por nombre de servicio (fastcgi_pass php:9000) =="
                    ok=0
                    for i in 1 2 3 4 5 6 7 8 9 10; do
                        if docker run --rm --network "$CI_NET" "taskflow-nginx:${IMAGE_TAG}" \
                             wget -qO- http://nginx/ | grep -q "<title>TaskFlow</title>"; then
                            ok=1; break
                        fi
                        echo "Intento $i sin respuesta, reintentando..."; sleep 3
                    done
                    [ "$ok" -eq 1 ] || { echo "ERROR: nginx no obtuvo la página desde php"; exit 1; }

                    echo "== 4. php -> db por nombre de servicio (DB_HOST=db) =="
                    docker run --rm --network "$CI_NET" \
                        -e DB_DATABASE=taskapp -e DB_USERNAME=admin -e DB_PASSWORD=admin \
                        "taskflow-php:${IMAGE_TAG}" php -r '
                        $pdo = new PDO("mysql:host=db;dbname=" . getenv("DB_DATABASE"),
                                       getenv("DB_USERNAME"), getenv("DB_PASSWORD"));
                        echo "Conexión a db OK (MySQL " . $pdo->query("SELECT VERSION()")->fetchColumn() . ")\n";'

                    echo "== 5. API de punta a punta: nginx -> php -> db =="
                    docker run --rm --network "$CI_NET" "taskflow-nginx:${IMAGE_TAG}" \
                        wget -qO- "http://nginx/api.php?action=list"
                    echo
                    echo "Todas las pruebas pasaron"
                '''
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} OK: imágenes taskflow-php:${env.IMAGE_TAG} y taskflow-nginx:${env.IMAGE_TAG} construidas y verificadas."
        }
        fixed {
            echo 'El pipeline vuelve a estar en verde después de un build fallido.'
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} FALLÓ. Revisá los logs en la consola de Jenkins."
        }
        cleanup {
            // Siempre se apaga el entorno de prueba y se borra el .env temporal
            sh '$COMPOSE down -v --remove-orphans || true'
            sh 'rm -f .env'
        }
    }
}
