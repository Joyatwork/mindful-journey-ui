# Test diagnostic inscription

Write-Host "=== DIAGNOSTIC INSCRIPTION (ERREUR 422) ===" -ForegroundColor Red
Write-Host ""

$testData = @{
    name = "Test User"
    email = "test$(Get-Random)@example.com"
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

Write-Host "Donnees de test d'inscription :" -ForegroundColor Yellow
Write-Host $testData

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/register" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "Inscription reussie !" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "ERREUR d'inscription detectee :" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details de l'erreur 422:" -ForegroundColor Red
        Write-Host $errorBody -ForegroundColor White
    }
}
