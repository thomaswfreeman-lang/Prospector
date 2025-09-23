const REQUIRED = ["OPENAI_API_KEY","SERPAPI_API_KEY","SAM_API_KEY","REDIS_URL"];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing env vars:", missing.join(", "));
  process.exit(1);
} else {
  console.log("✅ Env check passed.");
}
