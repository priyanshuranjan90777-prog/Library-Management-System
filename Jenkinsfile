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
                set -e
                echo "======================================"
                echo "Repository Verification"
                echo "======================================"
                pwd
                ls -la
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                    set -e
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
                    set -e
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
                    set -e
                    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                set -e

                echo "======================================"
                echo "Pushing Backend Image"
                echo "======================================"
                docker push ${BACKEND_IMAGE}
                docker push ${BACKEND_LATEST}

                echo ""

                echo "======================================"
                echo "Pushing Frontend Image"
                echo "======================================"
                docker push ${FRONTEND_IMAGE}
                docker push ${FRONTEND_LATEST}
                '''
            }
        }

        stage('Pipeline Summary') {
            steps {
                sh '''
                echo ""
                echo "==========================================="
                echo "      CI/CD PIPELINE COMPLETED"
                echo "==========================================="
                echo "Backend Image : ${BACKEND_IMAGE}"
                echo "Frontend Image: ${FRONTEND_IMAGE}"
                echo ""
                echo "Docker Images built successfully."
                echo "Docker Images pushed successfully."
                echo "==========================================="
                '''
            }
        }
    }

    post {

        success {
            echo "CI/CD Pipeline completed successfully."
        }

        failure {
            echo "CI/CD Pipeline failed. Check the console output."
        }

        always {
            echo "Pipeline execution finished."
        }
    }
}