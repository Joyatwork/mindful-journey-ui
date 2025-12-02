<#
 Script de démarrage unifié Mindful Journey
 - Vérifie prérequis (Node, PHP, dépendances)
 - Libère le port 8080 si occupé
 - Démarre Laravel sur 8081 (API)
 - Démarre Vite React sur 8080 (frontend)
#>

Write-Host "🚀 Démarrage Mindful Journey (mode développement)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
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
if (-not (Test-Path "backend\mindful-journey-back")) {
    Write-Host "❌ Dossier backend non trouvé!" -ForegroundColor Red
    Write-Host "   Chemin attendu: backend\mindful-journey-back" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow

Push-Location (Split-Path $MyInvocation.MyCommand.Path)

# Vérifier les dépendances frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules absent -> npm install" -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "❌ npm install a échoué" -ForegroundColor Red; Pop-Location; exit 1 }
}

# Vérifier les dépendances backend
if (-not (Test-Path "backend\mindful-journey-back\vendor")) {
    Write-Host "⚠️  vendor non trouvé. Installation des dépendances Laravel..." -ForegroundColor Yellow
    Set-Location "backend\mindful-journey-back"
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
$envPath = "backend\mindful-journey-back\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  Fichier .env Laravel non trouvé. Création à partir de .env.example..." -ForegroundColor Yellow
    Copy-Item "backend\mindful-journey-back\.env.example" $envPath
    
    # Générer la clé d'application Laravel
    Set-Location "backend\mindful-journey-back"
    php artisan key:generate
    Set-Location "..\..\"
}

Write-Host ""
Write-Host "🚀 Démarrage des serveurs..." -ForegroundColor Green

function Kill-Port($port) {
    Write-Host "🔍 Scan port $port" -ForegroundColor DarkGray
    $attempt = 0
    while ($attempt -lt 3) {
        $lines = netstat -ano | Select-String ":$port" | ForEach-Object { $_.ToString() }
        if (-not $lines) { Write-Host "✅ Port $port libre" -ForegroundColor Green; return }
        $pids = $lines | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
        foreach ($pid in $pids) {
            if ($pid -match '^[0-9]+$') {
                try {
                    $procName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
                    Write-Host "🛑 Kill PID=$pid ($procName) sur port $port" -ForegroundColor Yellow
                    taskkill /PID $pid /F | Out-Null
                } catch { Write-Host "⚠️ Impossible de tuer PID $pid" -ForegroundColor DarkYellow }
            }
        }
        Start-Sleep -Milliseconds 700
        $attempt++
    }
    # Dernière vérif
    $still = netstat -ano | Select-String ":$port"
    if ($still) { Write-Host "❌ Port $port encore occupé. Relance en échec." -ForegroundColor Red }
}

Write-Host "🔌 Vérification port frontend (8080)" -ForegroundColor Yellow
Kill-Port 8080
if ((netstat -ano | Select-String ':8080')) {
    Write-Host "⚠️ Abandon (port 8080 non libéré). Exécute manuellement :" -ForegroundColor Red
    Write-Host "   netstat -ano | findstr :8080" -ForegroundColor DarkCyan
    Write-Host "   taskkill /PID <PID> /F" -ForegroundColor DarkCyan
    return
}

Write-Host "🔌 Vérification port backend (8081)" -ForegroundColor Yellow
Kill-Port 8081
if ((netstat -ano | Select-String ':8081')) {
    Write-Host "⚠️ Abandon (port 8081 non libéré). Exécute manuellement :" -ForegroundColor Red
    Write-Host "   netstat -ano | findstr :8081" -ForegroundColor DarkCyan
    Write-Host "   taskkill /PID <PID> /F" -ForegroundColor DarkCyan
    return
}

Write-Host "🧪 Lancement backend Laravel (port 8081)" -ForegroundColor Yellow
$backendDir = "..\backend\mindful-journey-back"
if (-not (Test-Path $backendDir)) { Write-Host "❌ Backend introuvable: $backendDir" -ForegroundColor Red; Pop-Location; exit 1 }
$laravelCmd = "cd '$backendDir'; php artisan serve --host=127.0.0.1 --port=8081"
$laravelProcess = Start-Process powershell -ArgumentList "-NoExit","-Command", $laravelCmd -PassThru
Start-Sleep -Seconds 3

Write-Host "⚛️  Lancement frontend Vite (port 8080)" -ForegroundColor Yellow
$frontendCmd = "npm run dev -- --port 8080"
$reactProcess = Start-Process powershell -ArgumentList "-NoExit","-Command", $frontendCmd -PassThru

Pop-Location

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
Write-Host "⚠️  Pour arrêter: fermer les 2 fenêtres PowerShell (frontend & backend)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
