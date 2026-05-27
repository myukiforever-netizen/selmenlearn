import { Redis } from "ioredis";

// Redis is optional — when REDIS_URL is absent, queue jobs are no-ops
export const redis: Redis | null = process.env.REDIS_URL
  ? (() => {
      const client = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
      });
      client.on("error", (err) => {
        console.error("[Redis] Connection error:", err.message);
      });
      client.on("connect", () => {
        console.log("[Redis] Connected");
      });
      return client;
    })()
  : null;
