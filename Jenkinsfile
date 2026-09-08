pipeline {
    agent { label 'suraj' }

    stages {

        stage('Code Clone') {
            steps {
                echo "Cloning Repository..."
                git(
                    url: 'https://github.com/Suraj-dot-wq/Personal-Notes-App.git',
                    branch: 'main'
                )
            }
        }

        stage('Build React Frontend') {
            steps {
                dir('mynotes') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t notes-app:latest .
                    docker build -t notes-nginx:latest -f nginx/Dockerfile .
                '''
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerHubCred',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        docker tag notes-app:latest $DOCKER_USER/notes-app:latest
                        docker tag notes-nginx:latest $DOCKER_USER/notes-nginx:latest

                        docker push $DOCKER_USER/notes-app:latest
                        docker push $DOCKER_USER/notes-nginx:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose down || true

                    docker pull surajghadage2004/notes-app:latest
                    docker pull surajghadage2004/notes-nginx:latest

                    docker compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully."
        }

        failure {
            echo "Pipeline failed."
        }
    }
}