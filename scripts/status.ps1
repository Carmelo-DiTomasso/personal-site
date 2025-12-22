Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section([string]$Title) {
  Write-Host ""
  Write-Host "== $Title =="
}

Write-Section "Containers"
docker compose ps

Write-Section "Local URLs"
Write-Host "Frontend: http://localhost:5173/"
Write-Host "Backend:  http://localhost:8000/"
Write-Host "Health:   http://localhost:8000/api/health/"

Write-Section "Health Check"
try {
  $resp = Invoke-RestMethod -Uri "http://localhost:8000/api/health/" -TimeoutSec 3
  if ($resp.status -eq "ok") {
    Write-Host "OK: backend health returned status=ok"
    exit 0
  }
  Write-Host "WARN: backend health response missing status=ok"
  exit 1
} catch {
  Write-Host "ERROR: backend health check failed. Is the stack up? Try: .\scripts\dev.ps1"
  Write-Host $_.Exception.Message
  exit 1
}
