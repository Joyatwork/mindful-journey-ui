# Script d'aide pour la configuration Google OAuth

Write-Host "=== CONFIGURATION GOOGLE OAUTH - ASSISTANT INTERACTIF ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. CREATION DU PROJET GOOGLE CLOUD :" -ForegroundColor Cyan
Write-Host "   - Allez sur : https://console.cloud.google.com/" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'Select a project' en haut" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'NEW PROJECT'" -ForegroundColor Gray
Write-Host "   - Nom du projet : 'Mindful Journey'" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'CREATE'" -ForegroundColor Gray
Write-Host ""

Write-Host "2. ACTIVATION DES APIs :" -ForegroundColor Cyan
Write-Host "   - Dans le menu, allez dans 'APIs & Services' > 'Library'" -ForegroundColor Gray
Write-Host "   - Recherchez 'Google+ API' et activez-la" -ForegroundColor Gray
Write-Host "   - Recherchez 'People API' et activez-la" -ForegroundColor Gray
Write-Host ""

Write-Host "3. CONFIGURATION OAUTH 2.0 :" -ForegroundColor Cyan
Write-Host "   - Allez dans 'APIs & Services' > 'Credentials'" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'CREATE CREDENTIALS' > 'OAuth 2.0 Client IDs'" -ForegroundColor Gray
Write-Host ""

Write-Host "4. ECRAN DE CONSENTEMENT (si demande) :" -ForegroundColor Cyan
Write-Host "   - User Type : External" -ForegroundColor Gray
Write-Host "   - App name : Mindful Journey" -ForegroundColor Gray
Write-Host "   - User support email : votre email" -ForegroundColor Gray
Write-Host "   - Developer contact : votre email" -ForegroundColor Gray
Write-Host ""

Write-Host "5. CREATION DES CREDENTIALS :" -ForegroundColor Cyan
Write-Host "   - Application type : Web application" -ForegroundColor Gray
Write-Host "   - Name : Mindful Journey Web Client" -ForegroundColor Gray
Write-Host ""

Write-Host "6. URIS AUTORISES (COPIER-COLLER EXACTEMENT) :" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Authorized JavaScript origins :" -ForegroundColor Yellow
Write-Host "   http://localhost:8080" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host "   http://127.0.0.1:8081" -ForegroundColor White
Write-Host ""
Write-Host "   Authorized redirect URIs :" -ForegroundColor Yellow
Write-Host "   http://127.0.0.1:8081/api/auth/google/callback" -ForegroundColor White
Write-Host ""

Write-Host "7. RECUPERATION DES CREDENTIALS :" -ForegroundColor Cyan
Write-Host "   - Copiez le Client ID" -ForegroundColor Gray
Write-Host "   - Copiez le Client Secret" -ForegroundColor Gray
Write-Host ""

Write-Host "8. CONFIGURATION DANS LE PROJET :" -ForegroundColor Cyan
Write-Host "   - Une fois obtenus, executez ce script pour les configurer" -ForegroundColor Gray
Write-Host ""

Write-Host "Appuyez sur Entree quand vous avez vos credentials..." -ForegroundColor Green
$null = Read-Host

Write-Host ""
Write-Host "=== CONFIGURATION DES CREDENTIALS ===" -ForegroundColor Green
Write-Host ""

$clientId = Read-Host "Entrez votre GOOGLE_CLIENT_ID"
$clientSecret = Read-Host "Entrez votre GOOGLE_CLIENT_SECRET"

if ($clientId -and $clientSecret) {
    $envPath = "back-mindful-journey-iu\mindful-journey-back\.env"
    
    Write-Host "Configuration des credentials dans .env..." -ForegroundColor Yellow
    
    # Lire le fichier .env
    $envContent = Get-Content $envPath -Raw
    
    # Remplacer les valeurs Google OAuth
    $envContent = $envContent -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$clientId"
    $envContent = $envContent -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$clientSecret"
    
    # Sauvegarder
    Set-Content $envPath $envContent -Encoding UTF8
    
    Write-Host "Credentials configures avec succes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test de la configuration..." -ForegroundColor Cyan
    
    # Tester la configuration
    .\test-google-oauth.ps1
    
} else {
    Write-Host "Credentials manquants. Relancez le script quand vous les aurez." -ForegroundColor Red
}
