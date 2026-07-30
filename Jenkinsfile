pipeline {
    agent any

    environment {
        DOCKER_USER = "priyanshu907"
        IMAGE_TAG = "${BUILD_NUMBER}"

        BACKEND_IMAGE = "${DOCKER_USER}/library-backend:${IMAGE_TAG}"
        FRONTEND_IMAGE = "${DOCKER_USER}/library-frontend:${IMAGE_TAG}"

        BACKEND_LATEST = "${DOCKER_USER}/library-backend:latest"
        FRONTEND_LATEST = "${DOCKER_USER}/library-frontend:latest"

        KUBECONFIG = "/var/jenkins_home/.kube/config"
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
                echo "Pushing Backend..."
                docker push ${BACKEND_IMAGE}
                docker push ${BACKEND_LATEST}

                echo "Pushing Frontend..."
                docker push ${FRONTEND_IMAGE}
                docker push ${FRONTEND_LATEST}
                '''
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                sh '''
                echo "Updating Kubernetes manifests..."

                sed -i "s|image: .*library-backend:.*|image: ${BACKEND_IMAGE}|g" k8s/backend-deployment.yaml
                sed -i "s|image: .*library-frontend:.*|image: ${FRONTEND_IMAGE}|g" k8s/frontend-deployment.yaml

                echo ""
                echo "Backend Deployment Image:"
                grep image k8s/backend-deployment.yaml

                echo ""
                echo "Frontend Deployment Image:"
                grep image k8s/frontend-deployment.yaml
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                echo "======================================"
                echo "Deploying MySQL"
                echo "======================================"

                kubectl apply -f k8s/mysql-deployment.yaml
                kubectl apply -f k8s/mysql-service.yaml

                echo ""
                echo "======================================"
                echo "Deploying Backend"
                echo "======================================"

                kubectl apply -f k8s/backend-deployment.yaml
                kubectl apply -f k8s/backend-service.yaml

                echo ""
                echo "======================================"
                echo "Deploying Frontend"
                echo "======================================"

                kubectl apply -f k8s/frontend-deployment.yaml
                kubectl apply -f k8s/frontend-service.yaml
                '''
            }
        }

        stage('Wait For Rollout') {
            steps {
                sh '''
                echo "Waiting for MySQL..."
                kubectl rollout status deployment/mysql --timeout=180s

                echo ""
                echo "Waiting for Backend..."
                kubectl rollout status deployment/library-backend --timeout=180s

                echo ""
                echo "Waiting for Frontend..."
                kubectl rollout status deployment/library-frontend --timeout=180s
                '''
            }
        }

        stage('Verify Kubernetes Deployment') {
            steps {
                sh '''
                echo ""
                echo "======================================"
                echo "Pods"
                echo "======================================"
                kubectl get pods -o wide

                echo ""
                echo "======================================"
                echo "Deployments"
                echo "======================================"
                kubectl get deployments -o wide

                echo ""
                echo "======================================"
                echo "Services"
                echo "======================================"
                kubectl get svc

                echo ""
                echo "======================================"
                echo "Backend Deployment"
                echo "======================================"
                kubectl describe deployment library-backend

                echo ""
                echo "======================================"
                echo "Frontend Deployment"
                echo "======================================"
                kubectl describe deployment library-frontend
                '''
            }
        }

        stage('Pipeline Summary') {
            steps {
                sh '''
                echo ""
                echo "=============================================="
                echo "        CI/CD PIPELINE COMPLETED"
                echo "=============================================="
                echo "Backend Image : ${BACKEND_IMAGE}"
                echo "Frontend Image: ${FRONTEND_IMAGE}"
                echo ""
                echo "Docker Images pushed successfully."
                echo "Application deployed successfully."
                echo "Kubernetes rollout completed."
                echo "=============================================="
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
            sh '''
            echo ""
            echo "============= FINAL CLUSTER STATUS ============="

            kubectl get pods || true

            echo ""
            kubectl get deployments || true

            echo ""
            kubectl get svc || true

            echo ""
            kubectl get ingress || true

            echo "==============================================="
            '''
        }
    }
}