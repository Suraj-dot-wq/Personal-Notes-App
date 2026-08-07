@Library('Shared') _

pipeline {
    agent {
        label 'vivek'
    }

    stages {

        stage("Code Clone") {
            steps {
                sh "whoami"
                clone(
                    "https://github.com/Suraj-dot-wq/Personal-Notes-App.git",
                    "main"
                )
            }
        }

        stage("Build Docker Image") {
            steps {
                dockerbuild(
                    "notes-app",
                    "latest"
                )
            }
        }

        stage("Push to DockerHub") {
            steps {
                dockerpush(
                    "dockerHubCred",
                    "notes-app",
                    "latest"
                )
            }
        }

        stage("Deploy") {
            steps {
                deploy()
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline executed successfully"
        }

        failure {
            echo "❌ Pipeline execution failed"
        }

        always {
            cleanWs()
        }
    }
}
