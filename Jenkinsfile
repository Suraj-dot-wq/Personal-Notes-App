pipeline {

    agent {
        label 'nexavault-agent'
    }

    environment {
        DOCKER_APP   = 'surajghadage2004/notes-app'
        DOCKER_NGINX = 'surajghadage2004/notes-nginx'
        IMAGE_TAG    = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Checking out NexaVault source code..."

                checkout scm
            }
        }

        stage('Create MySQL Environment') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'nexavault-mysql-password',
                        variable: 'DB_PASSWORD'
                    ),
                    string(
                        credentialsId: 'nexavault-mysql-root-password',
                        variable: 'MYSQL_ROOT_PASSWORD'
                    )
                ]) {

                    sh '''
                        set +x

                        echo "Creating NexaVault Docker MySQL environment..."

                        cat > .env <<EOF
DB_NAME=nexavault
DB_USER=nexavault_admin
DB_PASSWORD=$DB_PASSWORD
DB_HOST=mysql
DB_PORT=3306
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
EOF

                        chmod 600 .env

                        echo "Docker MySQL environment file created successfully."
                        echo "Database host: mysql"
                        echo "Database port: 3306"
                        echo "Database name: nexavault"
                    '''
                }
            }
        }

        stage('Verify Agent') {
            steps {
                sh '''
                    echo "===== Agent ====="
                    whoami
                    hostname

                    echo "===== Tools ====="
                    node --version
                    npm --version
                    docker --version
                    docker compose version
                    git --version
                    trivy --version
                '''
            }
        }

        stage('Build React Frontend') {
            steps {
                dir('mynotes') {
                    sh '''
                        if [ -f package-lock.json ]; then
                            npm ci
                        else
                            npm install
                        fi

                        npm run build
                    '''
                }
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh '''
                    echo "===== Validating Docker Compose ====="

                    docker compose config

                    echo "Docker Compose configuration is valid."
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "Building Django application image..."

                    docker build \
                        -t ${DOCKER_APP}:${IMAGE_TAG} \
                        -t ${DOCKER_APP}:latest \
                        .

                    echo "Building Nginx image..."

                    docker build \
                        -t ${DOCKER_NGINX}:${IMAGE_TAG} \
                        -t ${DOCKER_NGINX}:latest \
                        -f nginx/Dockerfile \
                        .

                    echo "Docker images built successfully."
                '''
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh '''
                    echo "===== Docker Images ====="

                    docker images | grep -E "notes-app|notes-nginx"

                    docker inspect ${DOCKER_APP}:${IMAGE_TAG} > /dev/null
                    docker inspect ${DOCKER_NGINX}:${IMAGE_TAG} > /dev/null

                    echo "Docker images verified successfully."
                '''
            }
        }

        stage('Security Scan') {
            steps {
                sh '''
                    echo "===== Preparing Trivy temporary directory ====="

                    mkdir -p /var/lib/trivy-tmp

                    echo "===== Trivy Scan: Django Image ====="

                    TMPDIR=/var/lib/trivy-tmp trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        ${DOCKER_APP}:${IMAGE_TAG}

                    echo "===== Trivy Scan: Nginx Image ====="

                    TMPDIR=/var/lib/trivy-tmp trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        ${DOCKER_NGINX}:${IMAGE_TAG}

                    echo "Security scans completed."
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerHubCred',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASS" | docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin

                        echo "Pushing application image..."

                        docker push ${DOCKER_APP}:${IMAGE_TAG}
                        docker push ${DOCKER_APP}:latest

                        echo "Pushing Nginx image..."

                        docker push ${DOCKER_NGINX}:${IMAGE_TAG}
                        docker push ${DOCKER_NGINX}:latest

                        docker logout

                        echo "Docker images pushed successfully."
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    echo "Stopping previous deployment..."

                    docker compose down || true

                    echo "Pulling latest application images..."

                    docker pull ${DOCKER_APP}:latest
                    docker pull ${DOCKER_NGINX}:latest

                    echo "Starting NexaVault with MySQL..."

                    docker compose up -d --remove-orphans

                    echo "===== Running Containers ====="

                    docker compose ps
                '''
            }
        }

        stage('MySQL Health Check') {
            steps {
                sh '''
                    echo "Waiting for MySQL to become healthy..."

                    for i in $(seq 1 30); do

                        STATUS=$(docker inspect \
                            --format='{{.State.Health.Status}}' \
                            mysql_cont 2>/dev/null || echo "missing")

                        echo "MySQL health status: $STATUS"

                        if [ "$STATUS" = "healthy" ]; then
                            echo "MySQL is healthy."
                            break
                        fi

                        if [ "$STATUS" = "missing" ]; then
                            echo "ERROR: MySQL container was not found."
                            docker compose ps
                            exit 1
                        fi

                        sleep 5

                    done

                    FINAL_STATUS=$(docker inspect \
                        --format='{{.State.Health.Status}}' \
                        mysql_cont)

                    if [ "$FINAL_STATUS" != "healthy" ]; then
                        echo "ERROR: MySQL did not become healthy."
                        docker logs --tail 100 mysql_cont
                        exit 1
                    fi

                    echo "MySQL health check PASSED."
                '''
            }
        }

        stage('Django Health Check') {
            steps {
                sh '''
                    echo "Waiting for Django to start..."

                    sleep 15

                    echo "===== Container Status ====="

                    docker compose ps

                    echo "===== Django Logs ====="

                    docker logs --tail 100 django_cont

                    echo "===== HTTP Health Check ====="

                    curl -f --retry 5 --retry-delay 3 http://localhost/

                    echo ""
                    echo "NexaVault health check PASSED."
                '''
            }
        }

        stage('Verify MySQL Database') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'nexavault-mysql-password',
                        variable: 'DB_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "===== Checking NexaVault database ====="

                        docker exec \
                            mysql_cont \
                            mysql \
                            -u nexavault_admin \
                            -p"$DB_PASSWORD" \
                            -e "SHOW DATABASES;"

                        echo "===== Checking NexaVault tables ====="

                        docker exec \
                            mysql_cont \
                            mysql \
                            -u nexavault_admin \
                            -p"$DB_PASSWORD" \
                            nexavault \
                            -e "SHOW TABLES;"

                        echo "MySQL database verification PASSED."
                    '''
                }
            }
        }

        stage('Final Deployment Status') {
            steps {
                sh '''
                    echo "========================================="
                    echo "       NEXAVAULT DEPLOYMENT STATUS"
                    echo "========================================="

                    docker compose ps

                    echo ""
                    echo "Database: Docker MySQL 8.4"
                    echo "Database Host: mysql"
                    echo "Database Port: 3306"
                    echo "Database Name: nexavault"

                    echo ""
                    echo "NexaVault deployment completed successfully."

                    echo "========================================="
                '''
            }
        }
    }

    post {

        success {
            echo "NexaVault pipeline completed successfully."
            echo "Application is running with Docker MySQL."
        }

        failure {
            echo "NexaVault pipeline failed."
            echo "Check the failed stage and Docker logs."
        }

        always {
            sh '''
                echo "===== Final Docker Status ====="
                docker compose ps || true

                echo "===== Cleaning generated environment file ====="
                rm -f .env
            '''
        }
    }
}