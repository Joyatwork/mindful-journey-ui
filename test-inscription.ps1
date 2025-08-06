# Test d'inscription avec donnees valides

Write-Host "Test d'inscription avec donnees valides..." -ForegroundColor Green

$userData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

Write-Host "Donnees envoyees :" -ForegroundColor Yellow
Write-Host $userData

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
    
    Write-Host "Reponse (Status: $($response.StatusCode)):" -ForegroundColor Green
    Write-Host $response.Content
    
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
