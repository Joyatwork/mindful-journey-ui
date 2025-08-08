# Script PowerShell pour démarrer le frontend React et backend Laravel
# Mindf# Démarrer le backend Laravel
Write-Host "🔥 Démarrage du backend Laravel (Port 8081)..." -ForegroundColor Yellow
$laravelProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'back-mindful-journey-iu\mindful-journey-back'; Write-Host '🔥 Backend Laravel démarré sur http://localhost:8081' -ForegroundColor Green; php artisan serve --host=0.0.0.0 --port=8081" -PassThru

# Attendre que Laravel démarre
Start-Sleep -Seconds 4

# Démarrer le frontend React
Write-Host "⚛️  Démarrage du frontend React (Port 8080)..." -ForegroundColor Yellow
$reactProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🔥 Frontend React démarré sur http://localhost:8080' -ForegroundColor Green; npm run dev -- --port 8080" -PassThru - Mode Développement

Write-Host "🚀 Démarrage de Mindful Journey - Mode Développement" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les prérequis
Write-Host "🔍 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé! Veuillez installer Node.js" -ForegroundColor Red
    exit 1
}

# Vérifier PHP
try {
    $phpVersion = php --version | Select-Object -First 1
    Write-Host "✅ PHP détecté: $phpVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PHP non trouvé! Veuillez installer PHP" -ForegroundColor Red
    exit 1
}

# Vérifier si les dossiers existent
if (-not (Test-Path "back-mindful-journey-iu\mindful-journey-back")) {
    Write-Host "❌ Dossier backend non trouvé!" -ForegroundColor Red
    Write-Host "   Chemin attendu: back-mindful-journey-iu\mindful-journey-back" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow

# Vérifier les dépendances frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules non trouvé. Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances frontend!" -ForegroundColor Red
        exit 1
    }
}

# Vérifier les dépendances backend
if (-not (Test-Path "back-mindful-journey-iu\mindful-journey-back\vendor")) {
    Write-Host "⚠️  vendor non trouvé. Installation des dépendances Laravel..." -ForegroundColor Yellow
    Set-Location "back-mindful-journey-iu\mindful-journey-back"
    composer install --no-dev
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances Laravel!" -ForegroundColor Red
        exit 1
    }
    Set-Location "..\..\"
}

Write-Host ""
Write-Host "🔧 Configuration de l'environnement..." -ForegroundColor Yellow

# Vérifier le fichier .env Laravel
$envPath = "back-mindful-journey-iu\mindful-journey-back\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  Fichier .env Laravel non trouvé. Création à partir de .env.example..." -ForegroundColor Yellow
    Copy-Item "back-mindful-journey-iu\mindful-journey-back\.env.example" $envPath
    
    # Générer la clé d'application Laravel
    Set-Location "back-mindful-journey-iu\mindful-journey-back"
    php artisan key:generate
    Set-Location "..\..\"
}

Write-Host ""
Write-Host "🚀 Démarrage des serveurs..." -ForegroundColor Green

# Démarrer le backend Laravel
Write-Host "� Démarrage du backend Laravel (Port 8000)..." -ForegroundColor Yellow
$laravelProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'back-mindful-journey-iu\mindful-journey-back'; Write-Host '🔥 Backend Laravel démarré sur http://localhost:8000' -ForegroundColor Green; php artisan serve --host=0.0.0.0 --port=8000" -PassThru

# Attendre que Laravel démarre
Start-Sleep -Seconds 4

# Démarrer le frontend React
Write-Host "⚛️  Démarrage du frontend React (Port 8080)..." -ForegroundColor Yellow
$reactProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🔥 Frontend React démarré sur http://localhost:8080' -ForegroundColor Green; npm run dev" -PassThru

Write-Host ""
Write-Host "✅ Serveurs démarrés avec succès!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs d'accès:" -ForegroundColor White
Write-Host "   Frontend (React): http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Backend (Laravel): http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 API Endpoints disponibles:" -ForegroundColor White
Write-Host "   🔐 Auth: http://localhost:8081/api/auth/*" -ForegroundColor Gray
Write-Host "   📅 Rendez-vous: http://localhost:8081/api/appointments" -ForegroundColor Gray
Write-Host "   👨‍⚕️ Spécialistes: http://localhost:8081/api/specialists" -ForegroundColor Gray
Write-Host "   📊 Données santé: http://localhost:8081/api/health-data/*" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Conseils:" -ForegroundColor White
Write-Host "   • L'application fonctionne même si l'API est indisponible (fallback localStorage)" -ForegroundColor Gray
Write-Host "   • Les changements frontend sont rechargés automatiquement" -ForegroundColor Gray
Write-Host "   • Consultez la console des navigateurs pour les erreurs" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Pour arrêter les serveurs, fermez les fenêtres PowerShell ouvertes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
