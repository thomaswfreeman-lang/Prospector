export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

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
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  return handleSearch(q);
}

export async function POST(req: NextRequest) {
  const { q = '' } = await req.json().catch(() => ({ q: '' }));
  return handleSearch(q);
}

async function handleSearch(q: string) {
  // TODO: plug in your real unified search here.
  // Returning a stable shape so the UI doesn't crash.
  const payload: SearchResults = {
    success: true,
    echo: q,
    q,
    prospects: [],
    sources: [],
    totalAPIs: 0,
    successfulAPIs: 0,
    errors: []
  };
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
