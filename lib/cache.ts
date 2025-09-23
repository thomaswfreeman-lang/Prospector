// lib/cache.ts — optional Redis, falls back to in-memory if REDIS_URL or ioredis missing
type CacheEntry = { value: any; expiresAt: number };
const mem = new Map<string, CacheEntry>();

let RedisCtor: any = null;
let redis: any = null;

function ensureRedisCtor() {
  if (RedisCtor !== null) return RedisCtor;
  try {
    if (!process.env.REDIS_URL) { RedisCtor = undefined; return RedisCtor; }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RedisCtor = require('ioredis');
  } catch {
    RedisCtor = undefined;
  }
  return RedisCtor;
}

function getRedis(): any | null {
  if (!process.env.REDIS_URL) return null;
  if (redis) return redis;
  const Ctor = ensureRedisCtor();
  if (!Ctor) return null;
  try {
    redis = new Ctor(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });
  } catch {
    redis = null;
  }
  return redis;
}

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    if (r) {
      const s = await r.get(key);
      return s ? (JSON.parse(s) as T) : null;
    }
  } catch {}
  const it = mem.get(key);
  if (!it) return null;
  if (Date.now() > it.expiresAt) { mem.delete(key); return null; }
  return it.value as T;
}

export async function cacheSet<T = any>(key: string, value: T, ttlSec: number): Promise<void> {
  try {
    const r = getRedis();
    if (r) {
      await r.set(key, JSON.stringify(value), 'EX', ttlSec);
      return;
    }
  } catch {}
  mem.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}
