# Script de démarrage du projet Mindful Journey
# Ce script démarre automatiquement le frontend et le backend

Write-Host "🚀 Démarrage du projet Mindful Journey..." -ForegroundColor Green

# Démarrage du backend Laravel
Write-Host "📊 Démarrage du backend Laravel..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\camar\Bureau\mindful-journey-ui\back-mindful-journey-iu\mindful-journey-back'; php artisan serve --host=127.0.0.1 --port=8081"

# Attendre 3 secondes pour que le backend démarre
Start-Sleep -Seconds 3

# Démarrage du frontend React
Write-Host "⚛️ Démarrage du frontend React..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\camar\Bureau\mindful-journey-ui'; npm run dev"

# Attendre 5 secondes pour que le frontend démarre
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Projet démarré avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend React : http://localhost:8080" -ForegroundColor Yellow
Write-Host "🔧 Backend Laravel : http://127.0.0.1:8081" -ForegroundColor Yellow
Write-Host "📡 API Endpoints : http://127.0.0.1:8081/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour tester l'API :" -ForegroundColor White
Write-Host "  - Inscription : POST http://127.0.0.1:8081/api/auth/register" -ForegroundColor Gray
Write-Host "  - Connexion : POST http://127.0.0.1:8081/api/auth/login" -ForegroundColor Gray
Write-Host "  - Google OAuth : GET http://127.0.0.1:8081/api/auth/google" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Pour configurer Google OAuth, voir le fichier CONFIGURATION-GOOGLE-OAUTH.md" -ForegroundColor Magenta
