Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

docker compose exec frontend npm run format:write

# from frontend: npm run format -- --write
