Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  Write-Error $Message
  exit 1
}

function Step([string]$Label, [scriptblock]$Command) {
  Write-Host ""
  Write-Host "== $Label ==" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# Docker daemon sanity (same spirit as dev.ps1)
try {
  docker info *> $null
} catch {
  Fail "Docker doesn't seem to be running. Start Docker Desktop, then re-run scripts/check.ps1."
}

# Ensure stack is up (lint.ps1 uses docker compose exec)
$running = ""
try {
  $running = docker compose ps --status running --services
} catch {
  # ignore and let dev.ps1 handle failures
}

$needsBoot = ($running -notmatch 'backend') -or ($running -notmatch 'frontend')

if ($needsBoot) {
  Write-Host "Dev stack not running. Starting via scripts/dev.ps1..." -ForegroundColor Yellow
  .\scripts\dev.ps1
}

Step "Repo lint + format checks" {
  .\scripts\lint.ps1
}

Step "Backend tests" {
  docker compose exec -e TURNSTILE_SECRET_KEY= backend pytest
}

Step "Frontend lint" {
  docker compose exec frontend npm run lint
}

Step "Frontend typecheck" {
  docker compose exec frontend npm run typecheck
}

Write-Host ""
Write-Host "All checks passed." -ForegroundColor Green
