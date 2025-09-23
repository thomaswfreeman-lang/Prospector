import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL not set');
  client = new Redis(url, { lazyConnect: true });
  return client;
}
