# Test Google OAuth

Write-Host "Test de Google OAuth..." -ForegroundColor Green
Write-Host ""

# Test 1 : Vérifier si les credentials Google sont configurés
Write-Host "1. Verification des credentials Google..." -ForegroundColor Cyan

$envPath = "back-mindful-journey-iu\mindful-journey-back\.env"
$envContent = Get-Content $envPath -Raw

if ($envContent -match "GOOGLE_CLIENT_ID=(.+)" -and $Matches[1].Trim() -ne "") {
    Write-Host "   OK - GOOGLE_CLIENT_ID configuré" -ForegroundColor Green
    $clientIdConfigured = $true
} else {
    Write-Host "   ATTENTION - GOOGLE_CLIENT_ID vide" -ForegroundColor Yellow
    $clientIdConfigured = $false
}

if ($envContent -match "GOOGLE_CLIENT_SECRET=(.+)" -and $Matches[1].Trim() -ne "") {
    Write-Host "   OK - GOOGLE_CLIENT_SECRET configuré" -ForegroundColor Green
    $clientSecretConfigured = $true
} else {
    Write-Host "   ATTENTION - GOOGLE_CLIENT_SECRET vide" -ForegroundColor Yellow
    $clientSecretConfigured = $false
}

# Test 2 : Test de la route de redirection Google
Write-Host "2. Test de la route de redirection Google..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/google" -Method GET
    
    if ($response.StatusCode -eq 200) {
        $responseData = $response.Content | ConvertFrom-Json
        if ($responseData.url) {
            Write-Host "   OK - Route de redirection Google fonctionnelle" -ForegroundColor Green
            Write-Host "   URL de redirection générée: $($responseData.url.Substring(0,50))..." -ForegroundColor Gray
        } else {
            Write-Host "   ERREUR - Pas d'URL de redirection dans la réponse" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERREUR - Route Google non accessible: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Détails de l'erreur: $responseBody" -ForegroundColor Yellow
    }
}

# Test 3 : Simulation d'un callback Google (sans vraies données)
Write-Host "3. Test du callback Google..." -ForegroundColor Cyan
Write-Host "   INFO - Le callback nécessite des données réelles de Google" -ForegroundColor Gray

Write-Host ""
Write-Host "Resume des tests :" -ForegroundColor Blue

if ($clientIdConfigured -and $clientSecretConfigured) {
    Write-Host "  - Configuration Google : OK" -ForegroundColor Green
    Write-Host "  - Prêt pour l'authentification Google" -ForegroundColor Green
    Write-Host ""
    Write-Host "PROCHAINES ETAPES :" -ForegroundColor White
    Write-Host "  1. Testez dans le navigateur : http://127.0.0.1:8081/api/auth/google" -ForegroundColor Cyan
    Write-Host "  2. Cela vous redirigera vers Google pour l'authentification" -ForegroundColor Cyan
    Write-Host "  3. Après connexion, Google vous redirigera vers votre callback" -ForegroundColor Cyan
} else {
    Write-Host "  - Configuration Google : INCOMPLETE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ACTIONS REQUISES :" -ForegroundColor White
    Write-Host "  1. Suivez le guide : GUIDE-GOOGLE-OAUTH-SETUP.md" -ForegroundColor Cyan
    Write-Host "  2. Configurez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans .env" -ForegroundColor Cyan
    Write-Host "  3. Relancez ce test" -ForegroundColor Cyan
}

Write-Host ""
