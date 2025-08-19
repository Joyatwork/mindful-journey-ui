param(
  [string]$DbHost = "127.0.0.1",
  [int]$Port = 3306,
  [Parameter(Mandatory=$true)][string]$AdminUser,
  [Parameter(Mandatory=$true)][AllowEmptyString()][string]$AdminPassword,
  [string]$DbName = "mindful_journey",
  [string]$AppUser = "mj_user",
  [string]$AppPass = "Mj_Pass!123"
)

$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

$mysql = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysql) { throw "mysql client not found on PATH" }

$sql = @"
CREATE DATABASE IF NOT EXISTS $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$AppUser'@'localhost' IDENTIFIED BY '$AppPass';
CREATE USER IF NOT EXISTS '$AppUser'@'127.0.0.1' IDENTIFIED BY '$AppPass';
GRANT ALL PRIVILEGES ON $DbName.* TO '$AppUser'@'localhost';
GRANT ALL PRIVILEGES ON $DbName.* TO '$AppUser'@'127.0.0.1';
FLUSH PRIVILEGES;
"@

$pwArg = if ($AdminPassword) { "-p$AdminPassword" } else { "" }

function Invoke-MySql([string[]]$args, [string]$query) {
  $full = @()
  $full += $args
  $full += @('-u', $AdminUser)
  if ($AdminPassword) { $full += "-p$AdminPassword" }
  $full += @('-e', $query)
  & mysql @full 2>$null
  return ($LASTEXITCODE -eq 0)
}

# Find a working connection args (handles passwordless root + protocol quirks)
$attempts = @(
  @('--protocol=TCP','-h', $DbHost,      '-P', "$Port"),
  @('--protocol=TCP','-h', '127.0.0.1',  '-P', "$Port"),
  @('--protocol=TCP','-h', 'localhost',  '-P', "$Port"),
  @('-h', $DbHost,     '-P', "$Port"),
  @('-h', '127.0.0.1', '-P', "$Port"),
  @('-h', 'localhost', '-P', "$Port")
)

$workingArgs = $null
foreach ($a in $attempts) {
  if (Invoke-MySql $a "SELECT 1;") { $workingArgs = $a; break }
}
if (-not $workingArgs) { throw "Unable to connect to MySQL as $AdminUser. Check credentials or server protocol." }

if (-not $workingArgs) { throw "Unable to connect to MySQL as $AdminUser. Check credentials or server protocol." }

# Execute provisioning SQL
$fullRun = @()
$fullRun += $workingArgs
$fullRun += @('-u', $AdminUser)
if ($AdminPassword) { $fullRun += "-p$AdminPassword" }
$fullRun += @('-e', $sql)
& mysql @fullRun
if ($LASTEXITCODE -ne 0) { throw "MySQL provisioning failed" }

# Update .env
$envPath = Join-Path $PSScriptRoot ".env"
$content = Get-Content $envPath -Raw
$content = ($content -replace "(?m)^DB_CONNECTION=.*", "DB_CONNECTION=mysql")
$content = ($content -replace "(?m)^DB_HOST=.*", "DB_HOST=127.0.0.1")
$content = ($content -replace "(?m)^DB_PORT=.*", "DB_PORT=$Port")
if ($content -notmatch "(?m)^DB_DATABASE=") { $content += "`nDB_DATABASE=$DbName`n" } else { $content = ($content -replace "(?m)^DB_DATABASE=.*", "DB_DATABASE=$DbName") }
if ($content -notmatch "(?m)^DB_USERNAME=") { $content += "DB_USERNAME=$AppUser`n" } else { $content = ($content -replace "(?m)^DB_USERNAME=.*", "DB_USERNAME=$AppUser") }
if ($content -notmatch "(?m)^DB_PASSWORD=") { $content += "DB_PASSWORD=$AppPass`n" } else { $content = ($content -replace "(?m)^DB_PASSWORD=.*", "DB_PASSWORD=$AppPass") }
Set-Content $envPath $content -Encoding UTF8

# Run migrations
php artisan config:clear
php artisan migrate --force
if ($LASTEXITCODE -ne 0) { throw "Migrations failed" }
try { php artisan session:table } catch { }
php artisan migrate --force
Write-Host "Provisioning done. Start with: php artisan serve --host=127.0.0.1 --port=8081" -ForegroundColor Green
