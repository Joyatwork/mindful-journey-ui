# Script pour mettre à jour la configuration Google OAuth
# Mindful Journey - Nouvelle configuration des ports

Write-Host "🔧 MISE À JOUR CONFIGURATION GOOGLE OAUTH" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 NOUVELLES CONFIGURATIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend Laravel: http://localhost:8081" -ForegroundColor White
Write-Host "Frontend React:  http://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URIS DE REDIRECTION AUTORISÉES À AJOUTER:" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. http://localhost:8081/api/auth/google/callback" -ForegroundColor Green
Write-Host "2. http://localhost:8080/auth/google/callback" -ForegroundColor Green
Write-Host "3. http://127.0.0.1:8081/api/auth/google/callback" -ForegroundColor Green
Write-Host "4. http://127.0.0.1:8080/auth/google/callback" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 ORIGINES JAVASCRIPT AUTORISÉES À AJOUTER:" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. http://localhost:8080" -ForegroundColor Green
Write-Host "2. http://127.0.0.1:8080" -ForegroundColor Green
Write-Host ""

Write-Host "📝 ÉTAPES À SUIVRE:" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Aller sur: https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host "2. Sélectionner votre projet: 'mindful-journey-ui'" -ForegroundColor White
Write-Host "3. Cliquer sur votre ID client OAuth 2.0 existant" -ForegroundColor White
Write-Host "4. Dans 'URIs de redirection autorisées', AJOUTER les 4 URIs listées ci-dessus" -ForegroundColor White
Write-Host "5. Dans 'Origines JavaScript autorisées', AJOUTER les 2 origines listées ci-dessus" -ForegroundColor White
Write-Host "6. Cliquer 'ENREGISTRER'" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "--------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "• Gardez les anciennes URIs pour l'instant (au cas où)" -ForegroundColor Yellow
Write-Host "• Les changements peuvent prendre quelques minutes à se propager" -ForegroundColor Yellow
Write-Host "• Testez l'authentification après la mise à jour" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ CONFIGURATION LOCALE DÉJÀ MISE À JOUR:" -ForegroundColor Green
Write-Host "------------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "• .env: GOOGLE_REDIRECT_URI mis à jour vers le port 8081" -ForegroundColor Green
Write-Host "• vite.config.ts: Proxy configuré vers le port 8081" -ForegroundColor Green
Write-Host "• GoogleCallback.tsx: Redirige vers Index.tsx après connexion" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 UNE FOIS LA CONFIGURATION GOOGLE MISE À JOUR:" -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Redémarrer les serveurs si nécessaire" -ForegroundColor White
Write-Host "2. Tester la connexion Google sur: http://localhost:8080" -ForegroundColor White
Write-Host "3. Vérifier la redirection vers l'index après connexion" -ForegroundColor White
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
