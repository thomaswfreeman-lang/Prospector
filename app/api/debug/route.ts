import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const have = (k: string) => (process.env[k] ? "set" : "missing");
  return NextResponse.json({
    SERPAPI_KEY: have("SERPAPI_KEY"),
    SERPAPI_MONTHLY_QUOTA: have("SERPAPI_MONTHLY_QUOTA"),
    OPENAI_API_KEY: have("OPENAI_API_KEY"),
    GH_OWNER: have("GH_OWNER"),
    GH_REPO: have("GH_REPO"),
    GH_TOKEN: have("GH_TOKEN"),
  });
}
