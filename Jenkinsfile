pipeline {
    agent any

    environment {
        DOCKER_USER = "priyanshu907"
        IMAGE_TAG = "${BUILD_NUMBER}"

        FRONTEND_IMAGE = "${DOCKER_USER}/library-frontend:${IMAGE_TAG}"
        BACKEND_IMAGE = "${DOCKER_USER}/library-backend:${IMAGE_TAG}"
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
                echo "Current Workspace:"
                pwd
                ls -la
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t $BACKEND_IMAGE .
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                    docker build -t $FRONTEND_IMAGE .
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

        stage('Push Backend Image') {
            steps {
                sh '''
                    docker push $BACKEND_IMAGE
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                    docker push $FRONTEND_IMAGE
                '''
            }
        }

        stage('Pipeline Summary') {
            steps {
                sh '''
                echo "=============================================="
                echo "Docker Images Successfully Built & Pushed"
                echo "Backend Image : $BACKEND_IMAGE"
                echo "Frontend Image: $FRONTEND_IMAGE"
                echo "=============================================="
                '''
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline completed successfully!'
            echo "Backend Image : ${BACKEND_IMAGE}"
            echo "Frontend Image: ${FRONTEND_IMAGE}"
            echo 'Run Kubernetes deployment from your Windows host.'
        }

        failure {
            echo 'CI Pipeline failed. Please check the Jenkins console output.'
        }
    }
}