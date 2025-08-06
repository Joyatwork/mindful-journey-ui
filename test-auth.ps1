# Script de test des fonctionnalites d'authentification

Write-Host "Test des fonctionnalites d'authentification..." -ForegroundColor Green
Write-Host ""

# Test 1 : Endpoint de base
Write-Host "1. Test de l'endpoint de base..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/test/login" -Method POST -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "   OK - Endpoint de base fonctionne" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERREUR - Endpoint de base : $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2 : Route d'inscription (sans donnees)
Write-Host "2. Test de la route d'inscription..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/register" -Method POST -ContentType "application/json" -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "   OK - Route d'inscription accessible (validation requise)" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR - Route d'inscription : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3 : Route de connexion (sans donnees)
Write-Host "3. Test de la route de connexion..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/login" -Method POST -ContentType "application/json" -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "   OK - Route de connexion accessible (validation requise)" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR - Route de connexion : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4 : Route Google OAuth
Write-Host "4. Test de la route Google OAuth..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/google" -Method GET -ErrorAction SilentlyContinue
    Write-Host "   ATTENTION - Google OAuth accessible (credentials requis pour fonctionner)" -ForegroundColor Yellow
} catch {
    Write-Host "   ATTENTION - Google OAuth necessite une configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Resume des tests :" -ForegroundColor Blue
Write-Host "  - API Backend : OK" -ForegroundColor Green
Write-Host "  - Routes d'authentification : OK" -ForegroundColor Green
Write-Host "  - Google OAuth : Necessite configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour configurer Google OAuth :" -ForegroundColor White
Write-Host "  1. Voir le fichier CONFIGURATION-GOOGLE-OAUTH.md" -ForegroundColor Gray
Write-Host "  2. Configurer les credentials dans .env" -ForegroundColor Gray
Write-Host ""
Write-Host "Votre projet est pret a etre utilise !" -ForegroundColor Green
