$ErrorActionPreference = "Stop"

Write-Host "Running repo-wide checks (pre-commit)..." -ForegroundColor Cyan
pre-commit run --all-files
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running frontend prettier check..." -ForegroundColor Cyan
docker compose exec frontend npm run format:check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done." -ForegroundColor Green
