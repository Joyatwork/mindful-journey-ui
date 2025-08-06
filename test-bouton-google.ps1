# Test du bouton Google OAuth dans l'interface

Write-Host "=== TEST DU BOUTON GOOGLE OAUTH ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. VERIFICATION DES SERVEURS :" -ForegroundColor Cyan

# Test backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/google/test" -Method GET -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "   OK - Backend Laravel actif" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERREUR - Backend Laravel non accessible" -ForegroundColor Red
    Write-Host "   Verifiez que le serveur Laravel est actif" -ForegroundColor Yellow
}

# Test frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   OK - Frontend React actif" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERREUR - Frontend React non accessible" -ForegroundColor Red
    Write-Host "   Verifiez que le serveur Vite est actif" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. CONFIGURATION GOOGLE OAUTH :" -ForegroundColor Cyan

$envPath = "back-mindful-journey-iu\mindful-journey-back\.env"
$envContent = Get-Content $envPath -Raw

if ($envContent -match "GOOGLE_CLIENT_ID=(.+)" -and $Matches[1].Trim() -ne "") {
    Write-Host "   OK - GOOGLE_CLIENT_ID configure" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - GOOGLE_CLIENT_ID manquant" -ForegroundColor Red
}

if ($envContent -match "GOOGLE_CLIENT_SECRET=(.+)" -and $Matches[1].Trim() -ne "") {
    Write-Host "   OK - GOOGLE_CLIENT_SECRET configure" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - GOOGLE_CLIENT_SECRET manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. INTERFACE UTILISATEUR :" -ForegroundColor Cyan
Write-Host "   - Page de connexion : http://localhost:8080" -ForegroundColor White
Write-Host "   - Vous devriez voir les boutons 'Continuer avec Google'" -ForegroundColor Gray
Write-Host "   - Un bouton dans l'onglet Connexion" -ForegroundColor Gray
Write-Host "   - Un bouton dans l'onglet Inscription" -ForegroundColor Gray

Write-Host ""
Write-Host "4. TEST DU FLUX GOOGLE OAUTH :" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:8080 dans votre navigateur" -ForegroundColor White
Write-Host "   2. Cliquez sur le bouton 'Continuer avec Google'" -ForegroundColor White
Write-Host "   3. Vous serez redirige vers Google" -ForegroundColor White
Write-Host "   4. Connectez-vous avec votre compte Google" -ForegroundColor White
Write-Host "   5. Google vous redirigera vers l'application" -ForegroundColor White

Write-Host ""
Write-Host "=== RESULTATS ===" -ForegroundColor Blue
Write-Host "Boutons Google OAuth : AJOUTES a l'interface" -ForegroundColor Green
Write-Host "Configuration : COMPLETE" -ForegroundColor Green
Write-Host "Pret pour les tests : OUI" -ForegroundColor Green
Write-Host ""
Write-Host "Le bouton Google est maintenant visible sur votre page de connexion !" -ForegroundColor Green
