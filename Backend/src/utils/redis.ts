import Redis from "ioredis";
import { env } from "./env ";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  tls: {}, // ⚠️ Needed for Redis Cloud (keep this)
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});