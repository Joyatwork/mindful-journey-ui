# Script PowerShell pour configurer Google OAuth
# Utilisation: .\setup-google-oauth.ps1 "YOUR_CLIENT_ID" "YOUR_CLIENT_SECRET"

param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientSecret = ""
)

Write-Host "🔧 Configuration de Google OAuth..." -ForegroundColor Green
Write-Host "Client ID: $($ClientId.Substring(0, 20))..." -ForegroundColor Cyan

# Configuration du backend Laravel
$backendEnvPath = ".\back-mindful-journey-iu\mindful-journey-back\.env"
Write-Host "📝 Mise à jour du fichier .env backend..." -ForegroundColor Yellow

if (Test-Path $backendEnvPath) {
    # Lecture du contenu actuel
    $content = Get-Content $backendEnvPath -Raw
    
    # Vérifier si les lignes Google OAuth existent
    if ($content -match "GOOGLE_CLIENT_ID=") {
        $content = $content -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$ClientId"
    } else {
        $content += "`nGOOGLE_CLIENT_ID=$ClientId"
    }
    
    if ($ClientSecret -ne "") {
        if ($content -match "GOOGLE_CLIENT_SECRET=") {
            $content = $content -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$ClientSecret"
        } else {
            $content += "`nGOOGLE_CLIENT_SECRET=$ClientSecret"
        }
    }
    
    if (-not ($content -match "GOOGLE_REDIRECT_URI=")) {
        $content += "`nGOOGLE_REDIRECT_URI=http://127.0.0.1:8081/api/auth/google/callback"
    }
    
    # Écriture du nouveau contenu
    Set-Content -Path $backendEnvPath -Value $content -NoNewline
    Write-Host "✅ Backend configuré" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier .env backend non trouvé" -ForegroundColor Red
}

# Configuration du frontend React
$frontendEnvPath = ".\.env"
Write-Host "📝 Mise à jour du fichier .env frontend..." -ForegroundColor Yellow

if (Test-Path $frontendEnvPath) {
    # Lecture du contenu actuel
    $content = Get-Content $frontendEnvPath -Raw
    
    # Activer Google OAuth en enlevant le commentaire et en mettant le vrai Client ID
    $content = $content -replace "# VITE_GOOGLE_CLIENT_ID=.*", "VITE_GOOGLE_CLIENT_ID=$ClientId"
    
    # Si la ligne n'existe pas du tout, l'ajouter
    if (-not ($content -match "VITE_GOOGLE_CLIENT_ID=")) {
        $content = $content + "`nVITE_GOOGLE_CLIENT_ID=$ClientId"
    }
    
    # Écriture du nouveau contenu
    Set-Content -Path $frontendEnvPath -Value $content -NoNewline
    Write-Host "✅ Frontend configuré" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier .env frontend non trouvé" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Configuration terminée !" -ForegroundColor Green
Write-Host "📝 Redémarrage des serveurs requis :" -ForegroundColor Yellow
Write-Host "   1. Arrêtez les serveurs actuels (Ctrl+C)" -ForegroundColor Cyan
Write-Host "   2. Redemarrez le backend: cd back-mindful-journey-iu\mindful-journey-back; php artisan serve --port=8081" -ForegroundColor Cyan
Write-Host "   3. Redémarrez le frontend: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Testez l'authentification Google sur: http://localhost:8080/login" -ForegroundColor Magenta
