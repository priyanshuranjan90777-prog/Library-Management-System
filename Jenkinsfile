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

        stage('Load Images into Minikube') {
            steps {
                sh '''
                minikube image load $BACKEND_IMAGE
                minikube image load $FRONTEND_IMAGE
                '''
            }
        }

        stage('Update Kubernetes Images') {
            steps {
                sh '''
                kubectl set image deployment/library-backend backend=$BACKEND_IMAGE
                kubectl set image deployment/library-frontend frontend=$FRONTEND_IMAGE
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl apply -f k8s/
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                kubectl rollout status deployment/library-backend
                kubectl rollout status deployment/library-frontend

                kubectl get pods
                kubectl get svc
                kubectl get deployments
                '''
            }
        }
    }

    post {
        success {
            echo "Library Management System deployed successfully!"
        }

        failure {
            echo "Deployment failed. Please check Jenkins console output."
        }
    }
}