export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const base = new URL(req.url);
  base.pathname = base.pathname.replace('/api/unified-search.csv', '/api/unified-search');
  const res = await fetch(base.toString(), { method: 'GET', headers: { 'accept': 'application/json' } });
  if (!res.ok) return new NextResponse(`Error ${res.status}`, { status: res.status });

  const data = await res.json();
  const rows = (data?.prospects ?? []) as any[];
  const headers = ['title','organization','publishedDate','bidDueDate','url','type','source','host'];
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => toCsv(r[h] ?? '')).join(','))).join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="unified-search.csv"' }
  });
}

function toCsv(v: any) { const s = String(v).replace(/\r?\n/g, ' ').replace(/"/g, '""'); return /[",]/.test(s) ? `"${s}"` : s; }
