import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET() {
  return NextResponse.json({
    node: process.version,
    vercelEnv: process.env.VERCEL_ENV || null,
    has_OPENAI: !!process.env.OPENAI_API_KEY,
    has_SERPAPI: !!process.env.SERPAPI_API_KEY,
    has_SAM: !!process.env.SAM_API_KEY,
  });
}
