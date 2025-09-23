# Prospector — unified build helper (v2)
param([switch]$InstallNode = $false)

Write-Host "== Prospector | Unified Search Build v2 ==" -ForegroundColor Cyan

node -v
if ($LASTEXITCODE -ne 0) {
  Write-Error "Node.js not found. Install Node 20+ (LTS) and re-run."
  exit 1
}

if (Test-Path package-lock.json) { cmd /c "npm ci" } else { cmd /c "npm install" }

cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Build failed. Fix TypeScript/ESLint errors above."
  exit 1
}

Write-Host "Build OK. To run locally:" -ForegroundColor Green
Write-Host "  cmd /c npm run dev" -ForegroundColor Yellow
