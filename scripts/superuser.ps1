Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Non-interactive superuser creation requires these env vars:
# DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD
$u = $env:DJANGO_SUPERUSER_USERNAME
$e = $env:DJANGO_SUPERUSER_EMAIL
$p = $env:DJANGO_SUPERUSER_PASSWORD

if ([string]::IsNullOrWhiteSpace($u) -or [string]::IsNullOrWhiteSpace($e) -or [string]::IsNullOrWhiteSpace($p)) {
  Write-Host "Superuser not created. Set these env vars and re-run:"
  Write-Host "  DJANGO_SUPERUSER_USERNAME"
  Write-Host "  DJANGO_SUPERUSER_EMAIL"
  Write-Host "  DJANGO_SUPERUSER_PASSWORD"
  Write-Host ""
  Write-Host "Example (PowerShell):"
  Write-Host '  $env:DJANGO_SUPERUSER_USERNAME="admin"; $env:DJANGO_SUPERUSER_EMAIL="admin@example.com"; $env:DJANGO_SUPERUSER_PASSWORD="admin"; .\scripts\superuser.ps1'
  exit 1
}

# Run non-interactively (works without a TTY)
docker compose exec -T `
  -e DJANGO_SUPERUSER_PASSWORD="$p" `
  backend python manage.py createsuperuser --noinput --username "$u" --email "$e"
