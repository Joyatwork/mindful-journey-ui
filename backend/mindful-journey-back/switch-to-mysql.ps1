param(
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3306,
    [Parameter(Mandatory=$true)][string]$DbName,
    [Parameter(Mandatory=$true)][string]$DbUser,
    [Parameter(Mandatory=$true)][string]$DbPassword,
    [switch]$CreateDb
)

# Switch backend .env to MySQL and run migrations
Write-Host "[switch-to-mysql] Backend path: $PSScriptRoot" -ForegroundColor Cyan
Set-Location $PSScriptRoot

$envPath = Join-Path $PSScriptRoot ".env"
if (!(Test-Path $envPath)) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env" -Force
    Write-Host "Created .env from .env.example"
  } else {
    throw ".env and .env.example not found"
  }
}

# Read env as raw text
$envContent = Get-Content $envPath -Raw

function Set-Or-AddEnvLine([string]$content, [string]$key, [string]$value) {
  if ($content -match "(?m)^$([Regex]::Escape($key))=") {
    return ($content -replace "(?m)^$([Regex]::Escape($key))=.*", "$key=$value")
  } else {
    return ($content.TrimEnd() + "`n$key=$value`n")
  }
}

# Ensure DB_* entries
$envContent = ($envContent -replace "(?m)^DB_CONNECTION=.*", "DB_CONNECTION=mysql")
$envContent = Set-Or-AddEnvLine $envContent "DB_HOST" $DbHost
$envContent = Set-Or-AddEnvLine $envContent "DB_PORT" $DbPort
$envContent = Set-Or-AddEnvLine $envContent "DB_DATABASE" $DbName
$envContent = Set-Or-AddEnvLine $envContent "DB_USERNAME" $DbUser
$envContent = Set-Or-AddEnvLine $envContent "DB_PASSWORD" $DbPassword

# Optional: tidy legacy SQLite line if present
$envContent = ($envContent -replace "(?m)^DB_URL=.*", "DB_URL=")

Set-Content $envPath $envContent -Encoding UTF8
Write-Host "Updated .env with MySQL settings" -ForegroundColor Green

# Check PHP extension
try {
  $modules = & php -m 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Warning "php not found on PATH. Skipping extension check." }
  elseif (-not ($modules -match "pdo_mysql")) {
    Write-Warning "PHP extension pdo_mysql is not enabled. Enable it in php.ini (extension=pdo_mysql) then retry."
  } else {
    Write-Host "pdo_mysql extension detected" -ForegroundColor Green
  }
} catch { Write-Warning "Unable to check PHP modules: $_" }

# Optionally create database using mysql client
if ($CreateDb) {
  $mysqlExe = Get-Command mysql -ErrorAction SilentlyContinue
  if ($null -eq $mysqlExe) {
    Write-Warning "mysql client not found. Skipping CREATE DATABASE."
  } else {
    Write-Host "Creating database if not exists: $DbName"
    $pwArg = if ($DbPassword) { "-p$DbPassword" } else { "" }
    & mysql -h $DbHost -P $DbPort -u $DbUser $pwArg -e "CREATE DATABASE IF NOT EXISTS `$DbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "Database ensured." -ForegroundColor Green } else { Write-Warning "CREATE DATABASE may have failed. Check credentials/permissions." }
  }
}

# Run migrations
Write-Host "Running migrations..."
& php artisan migrate --force
if ($LASTEXITCODE -eq 0) {
  Write-Host "Migrations completed." -ForegroundColor Green
} else {
  Write-Warning "Migrations failed. Check output above."
}

Write-Host "Done. Start the server with: php artisan serve --host=127.0.0.1 --port=8081"
