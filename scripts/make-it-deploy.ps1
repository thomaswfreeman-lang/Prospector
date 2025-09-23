# Prospector — make-it-deploy.ps1
param(
  [switch]$InstallNode = $false
)

Write-Host "== Prospector | Make It Deploy ==" -ForegroundColor Cyan

# Verify Node
node -v
if ($LASTEXITCODE -ne 0) {
  Write-Error "Node.js not found. Install Node 20+ (LTS) and re-run."
  exit 1
}

# Restore deps (npm)
if (Test-Path package-lock.json) {
  npm ci
} else {
  npm install
}

# Optional: pull env from Vercel (requires Vercel CLI)
# vercel env pull .env.local

# Build
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Error "Build failed. Fix TypeScript/ESLint errors above."
  exit 1
}

Write-Host "Build OK. To run locally:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Yellow
