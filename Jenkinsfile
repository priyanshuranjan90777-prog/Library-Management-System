pipeline {
    agent any

    environment {
        DOCKER_USER = "priyanshu907"
        IMAGE_TAG = "${BUILD_NUMBER}"

        BACKEND_IMAGE = "${DOCKER_USER}/library-backend:${IMAGE_TAG}"
        FRONTEND_IMAGE = "${DOCKER_USER}/library-frontend:${IMAGE_TAG}"

        BACKEND_LATEST = "${DOCKER_USER}/library-backend:latest"
        FRONTEND_LATEST = "${DOCKER_USER}/library-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Repository') {
            steps {
                sh '''
                echo "========== Repository =========="
                pwd
                ls -la
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t ${BACKEND_IMAGE} .
                    docker tag ${BACKEND_IMAGE} ${BACKEND_LATEST}
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                    docker build -t ${FRONTEND_IMAGE} .
                    docker tag ${FRONTEND_IMAGE} ${FRONTEND_LATEST}
                    '''
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'jenkins-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                docker push ${BACKEND_IMAGE}
                docker push ${BACKEND_LATEST}

                docker push ${FRONTEND_IMAGE}
                docker push ${FRONTEND_LATEST}
                '''
            }
        }

        stage('Pipeline Summary') {
            steps {
                sh '''
                echo "========================================="
                echo "CI/CD PIPELINE COMPLETED SUCCESSFULLY"
                echo "========================================="
                echo "Backend Image : ${BACKEND_IMAGE}"
                echo "Frontend Image: ${FRONTEND_IMAGE}"
                echo "========================================="
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console output.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}