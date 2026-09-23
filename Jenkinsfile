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

        stage('Create RDS Environment') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'nexavault-rds-password',
                        variable: 'RDS_PASSWORD'
                    )
                ]) {

                    sh '''
                        set +x

                        echo "Creating NexaVault RDS environment..."

                        cat > .env <<EOF
DB_NAME=nexavault
DB_USER=nexavault_admin
DB_PASSWORD=$RDS_PASSWORD
DB_HOST=nexavault-mysql.cdcssqyw6r39.ap-south-1.rds.amazonaws.com
DB_PORT=3306
EOF

                        chmod 600 .env

                        echo "RDS environment file created successfully."
                        echo "Database host configured."
                        echo "Database port configured."
                        echo "Database name configured."
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

                    echo "Pulling latest images..."

                    docker pull ${DOCKER_APP}:latest
                    docker pull ${DOCKER_NGINX}:latest

                    echo "Starting NexaVault..."

                    docker compose up -d --remove-orphans

                    echo "===== Running Containers ====="

                    docker compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for NexaVault to start..."

                    sleep 15

                    echo "===== Container Status ====="

                    docker compose ps

                    echo "===== HTTP Health Check ====="

                    curl -f --retry 5 --retry-delay 3 http://localhost/

                    echo ""
                    echo "NexaVault health check PASSED."
                '''
            }
        }
    }

    post {

        success {
            echo """
            ==========================================
              NexaVault Deployment Successful
              Build: ${BUILD_NUMBER}
              Image Tag: ${IMAGE_TAG}
              Database: AWS RDS MySQL
            ==========================================
            """
        }

        failure {
            echo """
            ==========================================
              NexaVault Pipeline FAILED
              Build: ${BUILD_NUMBER}
            ==========================================
            """
        }

        always {
            sh '''
                echo "Cleaning generated RDS environment file..."

                rm -f .env

                echo "Cleaning unused Docker images..."

                docker image prune -f || true
            '''
        }
    }
}
```
