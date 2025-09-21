// app/api/unified-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setJSON, getJSON, setStamp } from "../../../lib/cache";
import { unifiedSearchRunner, UnifiedSearchResponse } from "../../../lib/search/unified";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_SECONDS = 60 * 60; // 1 hour

function ensureMetaArrays(resp: UnifiedSearchResponse): UnifiedSearchResponse {
  const meta = resp.meta || ({} as any);
  return {
    ...resp,
    meta: {
      finished: Array.isArray(meta.finished) ? meta.finished : [],
      pending: Array.isArray(meta.pending) ? meta.pending : [],
      errors: Array.isArray(meta.errors) ? meta.errors : [],
      sourcesSuccessful: Array.isArray(meta.sourcesSuccessful) ? meta.sourcesSuccessful : [],
      sourcesFailed: Array.isArray(meta.sourcesFailed) ? meta.sourcesFailed : [],
    },
  };
}

function keyFor(query: string, region: string, limit: number) {
  return `unified:${region}:${limit}:${query.toLowerCase()}`;
}

async function runAndCache(key: string, params: { query: string; region: string; limit: number }) {
  const fresh = await unifiedSearchRunner(params);
  const normalized = ensureMetaArrays(fresh);
  await setJSON(key, normalized, TTL_SECONDS);
  await setStamp(key);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || searchParams.get("query") || "").trim();
  const region = (searchParams.get("region") || "us").trim();
  const limit = Math.max(1, Math.min(parseInt(searchParams.get("limit") || "10", 10) || 10, 50));

  if (!query) {
    return NextResponse.json(
      {
        results: [],
        meta: {
          finished: [],
          pending: [],
          errors: [{ source: "input", message: "Missing query" }],
          sourcesSuccessful: [],
          sourcesFailed: [],
        },
      },
      { status: 400 }
    );
  }

  const key = keyFor(query, region, limit);

  // Cached-first response
  const cached = await getJSON<UnifiedSearchResponse>(key);
  if (cached) {
    // Refresh in background (fire-and-forget)
    runAndCache(key, { query, region, limit }).catch(() => {});
    return NextResponse.json({ ...ensureMetaArrays(cached), cached: true }, { status: 200 });
  }

  // Fresh compute
  const fresh = await unifiedSearchRunner({ query, region, limit });
  const normalized = ensureMetaArrays(fresh);
  await setJSON(key, normalized, TTL_SECONDS);
  await setStamp(key);

  return NextResponse.json({ ...normalized, cached: false }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = (body?.query || "").trim();
  const region = (body?.region || "us").trim();
  const limit = Math.max(1, Math.min(parseInt(body?.limit ?? "10", 10) || 10, 50));

  if (!query) {
    return NextResponse.json(
      {
        results: [],
        meta: {
          finished: [],
          pending: [],
          errors: [{ source: "input", message: "Missing query" }],
          sourcesSuccessful: [],
          sourcesFailed: [],
        },
      },
      { status: 400 }
    );
  }

  const key = keyFor(query, region, limit);

  // Cached-first for POST
  const cached = await getJSON<UnifiedSearchResponse>(key);
  if (cached) {
    runAndCache(key, { query, region, limit }).catch(() => {});
    return NextResponse.json({ ...ensureMetaArrays(cached), cached: true }, { status: 200 });
  }

  const fresh = await unifiedSearchRunner({ query, region, limit });
  const normalized = ensureMetaArrays(fresh);
  await setJSON(key, normalized, TTL_SECONDS);
  await setStamp(key);

  return NextResponse.json({ ...normalized, cached: false }, { status: 200 });
}
