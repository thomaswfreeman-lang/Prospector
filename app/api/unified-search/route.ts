// app/api/unified-search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Next 14 valid values: 'edge' | 'experimental-edge' | 'nodejs'

/**
 * Shared implementation.
 * Implement your real search here and return JSON-serializable data.
 */
async function runUnified(q: string) {
  // TODO: call your actual providers (OpenAI/SerpAPI/etc.)
  // This stub echoes back the query so you can verify the route works.
  return {
    success: true,
    prospects: [],
    sources: [],
    totalAPIs: 0,
    successfulAPIs: 0,
    echo: q ?? '',
    errors: [],
  };
}

/** GET → forwards to POST semantics so /api/unified-search?q=... works */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? '';
  return NextResponse.json(await runUnified(q));
}

/** Single POST handler (the only POST export in this file) */
export async function POST(req: NextRequest) {
  const { q = '' } = await req.json().catch(() => ({ q: '' }));
  return NextResponse.json(await runUnified(q));
}
