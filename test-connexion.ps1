# Test de connexion avec l'utilisateur cree

Write-Host "Test de connexion..." -ForegroundColor Green

$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Donnees de connexion :" -ForegroundColor Yellow
Write-Host $loginData

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    Write-Host "Connexion reussie (Status: $($response.StatusCode)):" -ForegroundColor Green
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "Utilisateur: $($responseData.user.name) - $($responseData.user.email)" -ForegroundColor Cyan
    Write-Host "Token: $($responseData.token.Substring(0,20))..." -ForegroundColor Cyan
    
    # Test du profil utilisateur avec le token
    Write-Host ""
    Write-Host "Test d'acces au profil avec le token..." -ForegroundColor Blue
    
    $headers = @{
        "Authorization" = "Bearer $($responseData.token)"
        "Accept" = "application/json"
    }
    
    $profileResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/user" -Method GET -Headers $headers
    $profileData = $profileResponse.Content | ConvertFrom-Json
    
    Write-Host "Profil recupere:" -ForegroundColor Green
    Write-Host "  ID: $($profileData.id)" -ForegroundColor Gray
    Write-Host "  Nom: $($profileData.name)" -ForegroundColor Gray
    Write-Host "  Email: $($profileData.email)" -ForegroundColor Gray
    
} catch {
    Write-Host "Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Reponse d'erreur:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
