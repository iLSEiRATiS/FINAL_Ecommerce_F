# backend/scripts/switch-default-to-main.ps1
Param(
  [Parameter(Mandatory=$true)][string]$Owner,
  [Parameter(Mandatory=$true)][string]$Repo,
  [Parameter(Mandatory=$true)][string]$Token,   # PAT con scope "repo"
  [switch]$DeleteMaster
)

$Headers = @{
  Authorization = "token $Token"
  "User-Agent"  = $Owner
  Accept        = "application/vnd.github+json"
}

function Get-Repo {
  Invoke-RestMethod -Method GET -Uri "https://api.github.com/repos/$Owner/$Repo" -Headers $Headers
}
function Set-DefaultMain {
  $body = @{ default_branch = "main" } | ConvertTo-Json
  Invoke-RestMethod -Method PATCH -Uri "https://api.github.com/repos/$Owner/$Repo" -Headers $Headers -Body $body
}
function Delete-RemoteMaster {
  try { git push origin --delete master } catch {
    try {
      Invoke-RestMethod -Method DELETE -Uri "https://api.github.com/repos/$Owner/$Repo/git/refs/heads/master" -Headers $Headers
    } catch {
      Write-Host "No pude borrar master con API (puede que ya no exista). Detalle: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
}

Write-Host "`n[1/3] Consultando repo..." -ForegroundColor Cyan
$info = Get-Repo
Write-Host "Default actual: $($info.default_branch)"

if ($info.default_branch -ne "main") {
  Write-Host "[2/3] Cambiando default branch a 'main'..." -ForegroundColor Cyan
  $updated = Set-DefaultMain
  Write-Host "Default ahora: $($updated.default_branch)" -ForegroundColor Green
} else {
  Write-Host "Ya estaba en 'main' como default." -ForegroundColor Green
}

try { git remote set-head origin -a | Out-Null } catch {}

if ($DeleteMaster) {
  Write-Host "[3/3] Borrando rama remota 'master'..." -ForegroundColor Yellow
  Delete-RemoteMaster
  git fetch -p | Out-Null
}

Write-Host "`nVerificación:" -ForegroundColor Cyan
git ls-remote --symref origin HEAD
Write-Host "`nRamas remotas:" -ForegroundColor Cyan
git branch -r
