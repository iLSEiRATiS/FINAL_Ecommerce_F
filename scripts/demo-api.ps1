# frontend/scripts/demo-api.ps1
Param(
  [string]$Base = "https://final-ecommerce-b.onrender.com"  # Cambiá a "http://localhost:4000" si probás local
)

function Show-Title([string]$text) {
  Write-Host ""
  Write-Host "=== $text ===" -ForegroundColor Cyan
}

function Invoke-Json($Method, $Url, $BodyObj) {
  $Headers = @{ "Content-Type" = "application/json" }
  $Body = $null
  if ($BodyObj -ne $null) { $Body = ($BodyObj | ConvertTo-Json -Depth 6) }
  try {
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -Body $Body
  } catch {
    Write-Host "ERROR:" $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message -ForegroundColor DarkYellow }
    return $null
  }
}

function Register-User([string]$name, [string]$email, [string]$password) {
  Show-Title "Register ($email)"
  $res = Invoke-Json POST "$Base/api/auth/register" @{
    name = $name
    email = $email
    password = $password
  }
  if ($res -ne $null) {
    $res | ConvertTo-Json -Depth 6
  }
}

function Login-User([string]$email, [string]$password) {
  Show-Title "Login ($email)"
  $res = Invoke-Json POST "$Base/api/auth/login" @{
    email = $email
    password = $password
  }
  if ($res -ne $null -and $res.token -and $res.user) {
    Write-Host "OK: token recibido" -ForegroundColor Green
    return $res
  } else {
    Write-Host "Login fallido." -ForegroundColor Red
    return $null
  }
}

function Admin-Users([string]$token) {
  Show-Title "GET /api/admin/users"
  try {
    $Headers = @{ "Authorization" = "Bearer $token" }
    $res = Invoke-RestMethod -Method GET -Uri "$Base/api/admin/users" -Headers $Headers
    $res | ConvertTo-Json -Depth 6
  } catch {
    Write-Host "ERROR:" $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message -ForegroundColor DarkYellow }
  }
}

function Health() {
  Show-Title "Healthcheck"
  try {
    $res = Invoke-RestMethod -Method GET -Uri "$Base/api/health"
    $res | ConvertTo-Json -Depth 6
  } catch {
    Write-Host "ERROR:" $_.Exception.Message -ForegroundColor Red
  }
}

# ===== DEMO =====
Health
Register-User -name "Facu" -email "facu@test.com" -password "123456"   # 201 o 409 si ya existe
$login = Login-User -email "facu@test.com" -password "123456"
if ($login -ne $null) {
  $token = $login.token
  Admin-Users -token $token   # 200 si sos admin, 403 si no
} else {
  Write-Host "No se pudo obtener token, fin de la demo." -ForegroundColor Red
}
