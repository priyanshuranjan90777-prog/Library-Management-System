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

                echo "Pushing Backend..."
                docker push ${BACKEND_IMAGE}
                docker push ${BACKEND_LATEST}

                echo ""
                echo "Pushing Frontend..."
                docker push ${FRONTEND_IMAGE}
                docker push ${FRONTEND_LATEST}
                '''
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                sh '''
                set -e

                echo "Updating Kubernetes manifests..."

                sed -i "s|image: .*library-backend:.*|image: ${BACKEND_IMAGE}|g" k8s/backend-deployment.yaml
                sed -i "s|image: .*library-frontend:.*|image: ${FRONTEND_IMAGE}|g" k8s/frontend-deployment.yaml

                echo ""
                echo "Backend Image:"
                grep image k8s/backend-deployment.yaml

                echo ""
                echo "Frontend Image:"
                grep image k8s/frontend-deployment.yaml
                '''
            }
        }

        stage('Verify Kubernetes Access') {
            steps {
                sh '''
                set -e

                export KUBECONFIG=/var/jenkins_home/.kube/config

                echo "======================================"
                echo "Kubernetes Debug"
                echo "======================================"

                echo "User        : $(whoami)"
                echo "Home        : $HOME"
                echo "Workspace   : $(pwd)"
                echo "KUBECONFIG  : $KUBECONFIG"

                echo ""
                ls -l /var/jenkins_home/.kube

                echo ""
                kubectl config current-context

                echo ""
                kubectl get nodes
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                set -e
                export KUBECONFIG=/var/jenkins_home/.kube/config

                echo "Deploying MySQL..."
                kubectl apply -f k8s/mysql-deployment.yaml
                kubectl apply -f k8s/mysql-service.yaml

                echo ""
                echo "Deploying Backend..."
                kubectl apply -f k8s/backend-deployment.yaml
                kubectl apply -f k8s/backend-service.yaml

                echo ""
                echo "Deploying Frontend..."
                kubectl apply -f k8s/frontend-deployment.yaml
                kubectl apply -f k8s/frontend-service.yaml
                '''
            }
        }

        stage('Wait For Rollout') {
            steps {
                sh '''
                set -e
                export KUBECONFIG=/var/jenkins_home/.kube/config

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
                set -e
                export KUBECONFIG=/var/jenkins_home/.kube/config

                echo ""
                echo "============== PODS =============="
                kubectl get pods -o wide

                echo ""
                echo "=========== DEPLOYMENTS =========="
                kubectl get deployments -o wide

                echo ""
                echo "============= SERVICES ==========="
                kubectl get svc

                echo ""
                echo "========== BACKEND ==============="
                kubectl describe deployment library-backend

                echo ""
                echo "========== FRONTEND =============="
                kubectl describe deployment library-frontend
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
                echo "Docker Images pushed successfully."
                echo "Application deployed successfully."
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
            echo "CI/CD Pipeline failed. Check console output."
        }

        always {
            sh '''
            export KUBECONFIG=/var/jenkins_home/.kube/config

            echo ""
            echo "========== FINAL CLUSTER STATUS =========="

            kubectl get pods || true

            echo ""
            kubectl get deployments || true

            echo ""
            kubectl get svc || true

            echo ""
            kubectl get ingress || true

            echo "=========================================="
            '''
        }
    }
}