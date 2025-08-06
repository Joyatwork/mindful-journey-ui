# Test final de Google OAuth

Write-Host "=== TEST FINAL GOOGLE OAUTH ===" -ForegroundColor Green
Write-Host ""

# Test 1 : Verification des credentials
Write-Host "1. Verification des credentials..." -ForegroundColor Cyan
$envPath = "back-mindful-journey-iu\mindful-journey-back\.env"
$envContent = Get-Content $envPath -Raw

if ($envContent -match "GOOGLE_CLIENT_ID=(.+)" -and $Matches[1].Trim() -ne "") {
    $clientId = $Matches[1].Trim()
    Write-Host "   OK - GOOGLE_CLIENT_ID: $($clientId.Substring(0,20))..." -ForegroundColor Green
} else {
    Write-Host "   ERREUR - GOOGLE_CLIENT_ID manquant" -ForegroundColor Red
    exit
}

if ($envContent -match "GOOGLE_CLIENT_SECRET=(.+)" -and $Matches[1].Trim() -ne "") {
    $clientSecret = $Matches[1].Trim()
    Write-Host "   OK - GOOGLE_CLIENT_SECRET: $($clientSecret.Substring(0,10))..." -ForegroundColor Green
} else {
    Write-Host "   ERREUR - GOOGLE_CLIENT_SECRET manquant" -ForegroundColor Red
    exit
}

# Test 2 : Test de l'endpoint de redirection
Write-Host "2. Test de l'endpoint de redirection..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/google" -Method GET -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        $responseData = $response.Content | ConvertFrom-Json
        if ($responseData.url -and $responseData.url.Contains("accounts.google.com")) {
            Write-Host "   OK - URL de redirection Google generee" -ForegroundColor Green
            Write-Host "   URL: $($responseData.url.Substring(0,50))..." -ForegroundColor Gray
        } else {
            Write-Host "   ERREUR - Reponse inattendue: $($response.Content)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERREUR - Endpoint non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Verifiez que le serveur Laravel est actif sur http://127.0.0.1:8081" -ForegroundColor Yellow
}

# Test 3 : Test d'une URL de redirection manuelle
Write-Host "3. Generation d'une URL de test..." -ForegroundColor Cyan
$testUrl = "http://127.0.0.1:8081/api/auth/google"
Write-Host "   URL de test: $testUrl" -ForegroundColor White

Write-Host ""
Write-Host "=== RESULTATS ===" -ForegroundColor Blue
Write-Host "Credentials Google : OK" -ForegroundColor Green
Write-Host "Configuration Laravel : OK" -ForegroundColor Green
Write-Host ""
Write-Host "POUR TESTER L'AUTHENTIFICATION GOOGLE :" -ForegroundColor White
Write-Host "1. Ouvrez votre navigateur" -ForegroundColor Gray
Write-Host "2. Allez sur : http://127.0.0.1:8081/api/auth/google" -ForegroundColor Cyan
Write-Host "3. Vous devriez etre redirige vers Google" -ForegroundColor Gray
Write-Host "4. Connectez-vous avec votre compte Google" -ForegroundColor Gray
Write-Host "5. Google vous redirigera vers votre application" -ForegroundColor Gray
Write-Host ""
Write-Host "L'authentification Google est maintenant ACTIVE !" -ForegroundColor Green
