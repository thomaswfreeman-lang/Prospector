// app/api/cron/daily-sam-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setJSON, setStamp } from "../../../../lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAM_CACHE_KEY = "sam:daily:us";
const TTL_SECONDS = 60 * 60 * 24; // 24h

type Prospect = {
  id?: string;
  title?: string;
  company?: string;
  url?: string;
  date?: string;
  catalyst?: string;
  source?: string;
  [k: string]: any;
};

// Placeholder to be replaced with real SAM.gov call.
async function fetchSAM(): Promise<Prospect[]> {
  const key = process.env.SAM_API_KEY;
  if (!key) {
    // Not wired yet; acceptable to return empty until implemented.
    return [];
  }

  // TODO: Implement the real SAM.gov fetch + mapping here.
  // Expected mapping:
  // id: sam.noticeId
  // title: sam.title
  // company: sam.agency || sam.department
  // url: sam.url
  // date: sam.postedDate
  // catalyst: derive from noticeType / set-aside / NAICS
  // source: "sam:daily"
  return [];
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const expected = process.env.CRON_SECRET || "";
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const items = await fetchSAM();
  const stamped = items.map((p) => ({ ...p, source: p.source || "sam:daily" }));

  await setJSON(SAM_CACHE_KEY, stamped, TTL_SECONDS);
  await setStamp(SAM_CACHE_KEY);

  return NextResponse.json({ ok: true, count: stamped.length }, { status: 200 });
}
