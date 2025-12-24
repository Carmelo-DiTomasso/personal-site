Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

docker compose exec frontend npm run format:write
