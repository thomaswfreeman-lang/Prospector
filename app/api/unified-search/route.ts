export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/cache';

type Prospect = {
  id: string;
  title?: string;
  url?: string;
  publishedDate?: string;
  bidDueDate?: string;
  organization?: string;
  contact?: string;
  location?: string;
  catalyst?: string;
  fit?: string;
  reasoning?: string;
  type?: string;
  source?: string;
  phone?: string;
  email?: string;
  host?: string;
};

type SearchResults = {
  success: boolean;
  echo: string;
  q: string;
  prospects: Prospect[];
  sources: string[];
  totalAPIs: number;
  successfulAPIs: number;
  errors: string[];
  cached?: boolean;
  version?: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? '';
  const type = url.searchParams.get('type') ?? '';
  const recency = url.searchParams.get('recency') ?? '';
  const site = url.searchParams.get('site') ?? '';
  const preset = url.searchParams.get('preset') ?? '';
  const nocache = url.searchParams.get('nocache') === '1';
  return handleSearch({ q, type, recency, site, preset, nocache });
}

export async function POST(req: Request) {
  const body = await safeJson(req);
  const { q = '', type = '', recency = '', site = '', preset = '', nocache = false } = body ?? {};
  return handleSearch({ q, type, recency, site, preset, nocache });
}

async function handleSearch(opts: { q: string; type?: string; recency?: string; site?: string; preset?: string; nocache?: boolean; }) {
  const { q } = opts;
  const errors: string[] = [];
  const sources: string[] = [];
  const chunks: Prospect[][] = [];
  let hit = 0; let total = 0;
  let cached = false;

  const expanded = expandQuery(opts);
  const key = `unified:${JSON.stringify(expanded)}`;

  if (!opts.nocache) {
    const cachedPayload = await cacheGet<SearchResults>(key);
    if (cachedPayload) {
      cached = true;
      return NextResponse.json(cachedPayload);
    }
  }

  // SerpAPI (web + news)
  total++;
  try {
    const serp = await fetchSerp(expanded);
    if (serp.length) { chunks.push(serp); hit++; sources.push('serpapi'); }
  } catch (e: any) { errors.push(`serpapi: ${e?.message || e}`); }

  const prospects = scoreAndDedupe(chunks.flat());
  const payload: SearchResults = {
    success: true,
    echo: q,
    q: expanded.qShown,
    prospects,
    sources,
    totalAPIs: total,
Set-Location -Path "C:\Users\tfreeman\ProspectorClean 2.0\ProspectorClean 2.0"

# Ensure folders exist
New-Item -ItemType Directory -Force -Path ".\app\api\unified-search",".\app\api\unified-search.csv",".\components",".\lib",".\scripts",".\app\about" | Out-Null

# app/api/unified-search/route.ts — SerpAPI-only unified search with filters, scoring, safe optional cache
@'
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/cache';

type Prospect = {
  id: string;
  title?: string;
  url?: string;
  publishedDate?: string;
  bidDueDate?: string;
  organization?: string;
  contact?: string;
  location?: string;
  catalyst?: string;
  fit?: string;
  reasoning?: string;
  type?: string;
  source?: string;
  phone?: string;
  email?: string;
  host?: string;
};

type SearchResults = {
  success: boolean;
  echo: string;
  q: string;
  prospects: Prospect[];
  sources: string[];
  totalAPIs: number;
  successfulAPIs: number;
  errors: string[];
  cached?: boolean;
  version?: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? '';
  const type = url.searchParams.get('type') ?? '';
  const recency = url.searchParams.get('recency') ?? '';
  const site = url.searchParams.get('site') ?? '';
  const preset = url.searchParams.get('preset') ?? '';
  const nocache = url.searchParams.get('nocache') === '1';
  return handleSearch({ q, type, recency, site, preset, nocache });
}

export async function POST(req: Request) {
  const body = await safeJson(req);
  const { q = '', type = '', recency = '', site = '', preset = '', nocache = false } = body ?? {};
  return handleSearch({ q, type, recency, site, preset, nocache });
}

async function handleSearch(opts: { q: string; type?: string; recency?: string; site?: string; preset?: string; nocache?: boolean; }) {
  const { q } = opts;
  const errors: string[] = [];
  const sources: string[] = [];
  const chunks: Prospect[][] = [];
  let hit = 0; let total = 0;
  let cached = false;

  const expanded = expandQuery(opts);
  const key = `unified:${JSON.stringify(expanded)}`;

  if (!opts.nocache) {
    const cachedPayload = await cacheGet<SearchResults>(key);
    if (cachedPayload) {
      cached = true;
      return NextResponse.json(cachedPayload);
    }
  }

  // SerpAPI (web + news)
  total++;
  try {
    const serp = await fetchSerp(expanded);
    if (serp.length) { chunks.push(serp); hit++; sources.push('serpapi'); }
  } catch (e: any) { errors.push(`serpapi: ${e?.message || e}`); }

  const prospects = scoreAndDedupe(chunks.flat());
  const payload: SearchResults = {
    success: true,
    echo: q,
    q: expanded.qShown,
    prospects,
    sources,
    totalAPIs: total,
    successfulAPIs: hit,
    errors,
    cached,
    version: 'unified-patch-2025-09-23-v2'
  };

  await cacheSet(key, payload, 60 * 60 * 24); // 24h
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}

async function safeJson(req: Request): Promise<any> { try { return await req.json(); } catch { return {}; } }

function expandQuery(opts: { q: string; type?: string; recency?: string; site?: string; preset?: string; }) {
  let { q, site, preset } = opts;
  const parts: string[] = [q];

  const presets: Record<string, string[]> = {
    universities: ['site:.edu', '("procurement" OR "purchasing" OR "RFP" OR "solicitation")'],
    gov: ['(site:.gov OR site:bonfirehub.ca OR site:bidsandtenders.ca OR site:publicpurchase.com)', '("RFP" OR "tender" OR "solicitation" OR "request for proposal")'],
    aerospace: ['(aerospace OR FAA OR NASA)', '(flammability OR "UL 94" OR "ASTM E1354" OR "ISO 5660")'],
    construction: ['(construction OR building OR furnishings)', '("ASTM E84" OR "NFPA 701" OR "ISO 9705")'],
  };
  if (preset && presets[preset]) parts.push(...presets[preset]);

  if (site) {
    if (site in { edu:1, gov:1, org:1, com:1, ca:1 }) parts.push(`site:.${site}`);
    else parts.push(`site:${site}`);
  }

  const qShown = parts.join(' ').replace(/\s+/g, ' ').trim();
  return { ...opts, qShown };
}

function scoreAndDedupe(list: Prospect[]) {
  const seen = new Set<string>();
  const scored = list.map(p => {
    const host = p.host || (p.url ? safeHost(p.url) : '');
    let score = 0;
    if (p.type === 'news') score += 5;
    if (host.endsWith('.edu')) score += 5;
    if (host.endsWith('.gov') || host.includes('bonfire') || host.includes('bidsandtenders')) score += 6;
    if (/UL\s?94|ASTM\s?E1354|ISO\s?5660|ISO\s?9705|ISO\s?11341|ASTM\s?E84|NFPA\s?701/i.test(p.title || '') ||
        /UL\s?94|ASTM\s?E1354|ISO\s?5660|ISO\s?9705|ISO\s?11341|ASTM\s?E84|NFPA\s?701/i.test(p.catalyst || '')) score += 8;
    return { p: { ...p, host }, score };
  }).sort((a,b) => b.score - a.score);

  const out: Prospect[] = [];
  for (const { p } of scored) {
    const key = (p.url || p.title || p.id).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function safeHost(u?: string): string { if (!u) return ''; try { return new URL(u).host.toLowerCase(); } catch { return ''; } }

async function fetchSerp(opts: { qShown: string; type?: string; recency?: string; }) {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new Error('SERPAPI_API_KEY missing');

  const engines = opts.type ? [opts.type === 'news' ? 'google_news' : 'google'] : ['google', 'google_news'];
  const tbs = recencyToTbs(opts.recency);

  const buildUrl = (eng: string) => {
    const base = `https://serpapi.com/search.json?engine=${eng}&q=${encodeURIComponent(opts.qShown)}&api_key=${key}`;
    if (eng === 'google' && tbs) return base + `&tbs=qdr:${tbs}`;
    if (eng === 'google_news' && opts.recency) return base + `&when=${opts.recency}`;
    return base;
  };

  const out: Prospect[] = [];
  for (const eng of engines) {
    const res = await fetch(buildUrl(eng));
    if (!res.ok) {
      out.push({ id: `serpapi-error-${Date.now()}-${eng}`, title: `SerpAPI ${eng} error HTTP ${res.status}`, source: 'serpapi', type: 'error', catalyst: '' });
      continue;
    }
    const json: any = await res.json();
    if (eng === 'google') {
      for (const r of json?.organic_results || []) {
        out.push({ id: r.link || r.title, title: r.title, url: r.link, publishedDate: normalizeDate(r.date), organization: r.source || safeHost(r.link), source: 'serpapi', type: 'web', catalyst: r.snippet, host: safeHost(r.link) });
      }
    } else {
      for (const n of json?.news_results || []) {
        out.push({ id: n.link || n.title, title: n.title, url: n.link, publishedDate: normalizeDate(n.date), organization: n.source || 'News', source: 'serpapi', type: 'news', catalyst: n.snippet, host: safeHost(n.link) });
      }
    }
  }
  return out;
}

function recencyToTbs(recency?: string) { if (!recency) return ''; if (/^1d$/i.test(recency)) return 'd'; if (/^7d$/i.test(recency)) return 'w'; if (/^30d$/i.test(recency)) return 'm'; return ''; }
function normalizeDate(x: any): string | undefined { if (!x) return undefined; const d = new Date(x); if (isNaN(+d)) return undefined; return d.toISOString().slice(0,10); }
