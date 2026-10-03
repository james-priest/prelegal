# Build and start Prelegal in Docker at http://localhost:8000
Set-Location (Join-Path $PSScriptRoot "..")

# Pass .env (API keys) to the container when present.
$envArgs = if (Test-Path .env) { @("--env-file", ".env") } else { @() }

docker build -t prelegal .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
docker rm -f prelegal *> $null
docker run -d --rm --name prelegal -p 8000:8000 @envArgs prelegal
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Prelegal running at http://localhost:8000"
