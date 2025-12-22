param(
  [int]$Tail = 200
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

docker compose logs -f --tail $Tail frontend
