import { isRedisConfigured, requireRedisConfig } from "../lib/redis-config";
import { getRedisClient } from "../lib/redis";
import { rateLimit } from "../lib/rate-limit";

async function main() {
  if (!isRedisConfigured()) {
    console.log(
      "Redis env incomplete. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in `.env`.",
    );
    console.log(
      "Day 8 rate limits will degrade (allow) until Redis is configured. DB PIN/setup locks still apply.",
    );
    process.exitCode = 0;
    return;
  }

  const config = requireRedisConfig();
  const redis = getRedisClient();
  const pong = await redis.ping();
  const probe = await rateLimit({
    key: "redis-check:probe",
    windowMs: 60_000,
    max: 100,
  });

  console.log("Upstash Redis check passed.");
  console.log(
    JSON.stringify(
      {
        ping: pong,
        urlHost: new URL(config.url).host,
        rateLimitProbe: probe,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Redis check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
