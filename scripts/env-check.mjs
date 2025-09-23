const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";

// Required now
const required = ["OPENAI_API_KEY", "SERPAPI_API_KEY"];

// Optional / future
const optional = [
  // "PERPLEXITY_API_KEY", // uncomment when you add it
  // "REDIS_URL",          // optional caching
  // "SAM_API_KEY"         // legacy, not required now
];

const missingRequired = required.filter(k => !process.env[k]);
const missingOptional = optional.filter(k => !process.env[k]);

if (missingRequired.length) {
  console.error("❌ Missing required env vars:", missingRequired.join(", "));
  process.exit(1);
}

if (env === "production" && missingOptional.length) {
  console.error("❌ Missing optional env vars in production:", missingOptional.join(", "));
  process.exit(1);
}

if (missingOptional.length) {
  console.warn("⚠️  Optional env vars missing (non-prod):", missingOptional.join(", "));
} else {
  console.log("✅ Env check passed.");
}
