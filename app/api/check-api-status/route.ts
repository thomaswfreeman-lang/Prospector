// app/api/check-api-status/route.ts
import { NextResponse } from "next/server";
import { getRedis } from "../../../lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // 1) Report whether env vars exist (doesn't validate billing/access, just presence)
  const env = {
    hasRedisEnv: !!process.env.REDIS_URL,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasXai: !!process.env.XAI_API_KEY,
    hasSerpApi: !!process.env.SERPAPI_KEY,
    hasSamApi: !!process.env.SAM_API_KEY,
    hasCronSecret: !!process.env.CRON_SECRET,
  };

  // 2) Try a Redis round-trip (set -> get -> del)
  let hasRedis = false;
  let roundTrip: "ok" | "mismatch" | "redis error" | "skip" = "skip";

  try {
    const r = getRedis(); // returns a singleton or null
    if (r) {
      hasRedis = true;
      const key = `health:ping:${Date.now()}`;
      await r.set(key, "pong", "EX", 30);
      const got = await r.get(key);
      roundTrip = got === "pong" ? "ok" : "mismatch";
      await r.del(key);
    }
  } catch (e: any) {
    roundTrip = "redis error";
  }

  return NextResponse.json({
    env,
    hasRedis,
    redisInfo: { roundTrip },
  });
}
