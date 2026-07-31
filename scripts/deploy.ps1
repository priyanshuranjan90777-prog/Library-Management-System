Write-Host "Deploying Library Management System to Kubernetes..."

kubectl apply -f k8s/

Write-Host ""
Write-Host "Waiting for Backend Deployment..."
kubectl rollout status deployment/library-backend

Write-Host ""
Write-Host "Waiting for Frontend Deployment..."
kubectl rollout status deployment/library-frontend

Write-Host ""
Write-Host "Waiting for MySQL Deployment..."
kubectl rollout status deployment/mysql

Write-Host ""
Write-Host "Pods:"
kubectl get pods

Write-Host ""
Write-Host "Services:"
kubectl get svc