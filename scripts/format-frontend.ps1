Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location .\frontend\
npm run format -- --write
Set-Location ..

# docker compose exec frontend npm run format:write

# from frontend: npm run format -- --write
