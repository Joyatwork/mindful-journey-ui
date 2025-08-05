# Script de démarrage automatique - Mindful Journey
Write-Host "🚀 Démarrage de Mindful Journey..." -ForegroundColor Green

# Vérifier que les dossiers existent
if (-not (Test-Path "backend")) {
    Write-Host "❌ Dossier backend introuvable" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Dossier frontend introuvable" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Structure du projet vérifiée" -ForegroundColor Green

# Démarrer le backend Laravel
Write-Host "🔧 Démarrage du backend Laravel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🔧 Backend Laravel démarré sur http://127.0.0.1:8081' -ForegroundColor Green; php artisan serve --port=8081"

# Attendre un peu
Start-Sleep -Seconds 3

# Démarrer le frontend React
Write-Host "⚛️ Démarrage du frontend React..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '⚛️ Frontend React démarré sur http://localhost:8080' -ForegroundColor Green; npm run dev"

Write-Host "✅ Les deux serveurs démarrent..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://127.0.0.1:8081" -ForegroundColor Cyan
Write-Host "🌐 API: http://127.0.0.1:8081/api" -ForegroundColor Cyan

# Attendre et ouvrir le navigateur
Start-Sleep -Seconds 8
Write-Host "🌐 Ouverture du navigateur..." -ForegroundColor Green
Start-Process "http://localhost:8080"
