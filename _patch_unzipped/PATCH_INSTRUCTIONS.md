# Prospector Quick Patch (Sept 23, 2025)

This patch gives you a **minimal, compilable** baseline while preserving your original (heavier) components.

## Files to copy into your repo

Copy these into the same relative paths (overwrite if they exist):

- `app/api/unified-search/route.ts`
- `app/page.tsx`
- `components/UnifiedSearchButton.tsx`
- `components/FireTestingApp.LITE.tsx` (new file)
- `lib/redis.ts` (switches to ioredis client; only matters if you actually use Redis)
- `scripts/make-it-deploy.ps1` (optional helper for Windows PowerShell)

> Note: Your original `components/FireTestingApp.tsx` is left untouched. The new `app/page.tsx` imports the **LITE** version so your app compiles immediately.

## Why this patch?

Your repo contains placeholder code segments (e.g., `...`) and duplicate/incomplete handlers in `app/api/unified-search/route.ts` and UI files, causing TypeScript/Next build failures. This patch:
- Replaces the unified-search API with a **stable JSON shape** (`{ success, echo, q, prospects, sources, totalAPIs, successfulAPIs, errors }`) that your UI expects.
- Provides a small, working `UnifiedSearchButton`.
- Adds a lightweight `FireTestingApp.LITE` screen so you can test end-to-end without touching your original large component yet.
- Aligns `lib/redis.ts` with **ioredis** (since your `package.json` depends on it).

## Build steps (Windows PowerShell)

```powershell
# From repo root
.\scripts\make-it-deploy.ps1
npm run dev
```

If you don't want the script:
```powershell
npm ci
npm run build
npm run dev
```

## macOS/Linux (Terminal)

```bash
npm ci
npm run build
npm run dev
```

## Vercel “Authentication Required” note

Your preview deployment is likely **Password Protected** on Vercel. Either disable protection in the project settings for previews, or include the `x-vercel-protection-bypass` header with a valid token when calling your API from scripts. Inside the browser (while logged in), calling `/api/unified-search?q=UL%2094` should work.

## Next steps

1. Verify local dev: open http://localhost:3000 → run a search.
2. If good, commit these files and push to **main**, then let Vercel rebuild.
3. When ready, migrate logic from your original `FireTestingApp.tsx` into the LITE component (or vice versa), removing placeholders (`...`) and fixing any `useState`/type issues.

— Generated 2025-09-23
