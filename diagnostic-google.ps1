# Test diagnostic Google OAuth

Write-Host "=== DIAGNOSTIC GOOGLE OAUTH (ERREUR REDIRECTION) ===" -ForegroundColor Red
Write-Host ""

Write-Host "1. Test de l'endpoint Google OAuth..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/google" -Method GET
    Write-Host "Succes ! Reponse Google OAuth :" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "URL generee: $($data.url)" -ForegroundColor White
} catch {
    Write-Host "ERREUR Google OAuth detectee :" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details de l'erreur:" -ForegroundColor Red
        Write-Host $errorBody -ForegroundColor White
    }
}

Write-Host ""
Write-Host "2. Verification de la configuration Google..." -ForegroundColor Cyan
$envPath = "back-mindful-journey-iu\mindful-journey-back\.env"
$envContent = Get-Content $envPath -Raw

if ($envContent -match "GOOGLE_CLIENT_ID=(.+)") {
    $clientId = $Matches[1].Trim()
    Write-Host "GOOGLE_CLIENT_ID: $($clientId.Substring(0,20))..." -ForegroundColor Green
}

if ($envContent -match "GOOGLE_CLIENT_SECRET=(.+)") {
    $clientSecret = $Matches[1].Trim()
    Write-Host "GOOGLE_CLIENT_SECRET: $($clientSecret.Substring(0,10))..." -ForegroundColor Green
}

if ($envContent -match "GOOGLE_REDIRECT_URI=(.+)") {
    $redirectUri = $Matches[1].Trim().Replace('"', '')
    Write-Host "GOOGLE_REDIRECT_URI: $redirectUri" -ForegroundColor Green
}
