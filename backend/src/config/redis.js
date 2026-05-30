import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  connectTimeout: 5000,
  retryStrategy(times) {
    if (times > 10) return null  // stop retrying after 10 attempts
    return Math.min(times * 100, 3000)
  }
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

/**
 * Check if Redis is alive by running PING command
 * @returns {Promise<boolean>} - true if Redis responds to PING, false otherwise
 */
export const isRedisAlive = async () => {
  try {
    const response = await redis.ping();
    return response === "PONG";
  } catch (err) {
    console.error("Redis PING failed:", err.message);
    return false;
  }
};

export default redis;
