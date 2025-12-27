Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

cd .\frontend\
npm run format -- --write

# docker compose exec frontend npm run format:write

# from frontend: npm run format -- --write
