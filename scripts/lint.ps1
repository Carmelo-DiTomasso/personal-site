$ErrorActionPreference = "Stop"

Write-Host "Running repo-wide checks (pre-commit)..." -ForegroundColor Cyan
pre-commit run --all-files

Write-Host "Done." -ForegroundColor Green
