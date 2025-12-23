Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

docker compose exec backend python manage.py seed_projects @args
