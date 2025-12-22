Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  Write-Error $Message
  exit 1
}

function Wait-ForHealth([int]$MaxAttempts = 30, [int]$DelaySeconds = 1) {
  $url = "http://localhost:8000/api/health/"

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      $resp = Invoke-RestMethod -Uri $url -TimeoutSec 3
      if ($resp.status -eq "ok") { return }
    } catch {
      # keep retrying
    }

    Start-Sleep -Seconds $DelaySeconds
  }

  Fail "Health check did not become ready at $url after $MaxAttempts attempts."
}

# 1) Docker daemon sanity
try {
  docker info *> $null
} catch {
  Fail "Docker doesn't seem to be running. Start Docker Desktop, then re-run scripts/dev.ps1."
}

# 2) Ensure .env exists (create from .env.example if missing)
if (-not (Test-Path ".\.env")) {
  if (Test-Path ".\.env.example") {
    Copy-Item ".\.env.example" ".\.env"
    Write-Host "Created .env from .env.example"
  } else {
    Fail "Missing .env and .env.example in repo root."
  }
}

Write-Host "Bringing up dev stack (docker compose up -d --build)..."

$artifactsDir = Join-Path $PSScriptRoot ".artifacts"
New-Item -ItemType Directory -Force -Path $artifactsDir | Out-Null

$stdout = Join-Path $artifactsDir "dev-compose-stdout.txt"
$stderr = Join-Path $artifactsDir "dev-compose-stderr.txt"

# Clear old logs
Remove-Item $stdout, $stderr -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath "docker" `
  -ArgumentList @("compose","up","-d","--build") `
  -NoNewWindow -Wait -PassThru `
  -RedirectStandardOutput $stdout `
  -RedirectStandardError $stderr

# Print combined output in a stable order (and avoid NativeCommandError)
if (Test-Path $stdout) { Get-Content $stdout | ForEach-Object { $_ } }
if (Test-Path $stderr) { Get-Content $stderr | ForEach-Object { $_ } }

if ($proc.ExitCode -ne 0) {
  Fail "docker compose up failed with exit code $($proc.ExitCode)"
}

Write-Host "Waiting for backend health..."
Wait-ForHealth

Write-Host "Dev stack is up (OK)"
docker compose ps
