import redis from "../config/redis.js";

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Parsed JSON value or null if not found or error
 */
export const getCache = async (key) => {
  try {
    const value = await redis.get(key);
    if (value === null) return null;
    return JSON.parse(value);
  } catch (err) {
    console.error(`Cache get error for key ${key}:`, err.message);
    return null; // Return null on error (cache miss)
  }
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {Promise<void>}
 */
export const setCache = async (key, value, ttlSeconds) => {
  try {
    const jsonValue = JSON.stringify(value);
    await redis.setex(key, ttlSeconds, jsonValue);
  } catch (err) {
    console.error(`Cache set error for key ${key}:`, err.message);
    // No-op on error - don't throw
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} - Number of keys deleted (0 or 1)
 */
export const deleteCache = async (key) => {
  try {
    return await redis.del(key);
  } catch (err) {
    console.error(`Cache delete error for key ${key}:`, err.message);
    return 0;
  }
};

/**
 * Delete multiple cache keys matching a pattern using SCAN (production safe)
 * @param {string} pattern - Pattern to match (e.g., "movies:page:*")
 * @returns {Promise<number>} - Total number of keys deleted
 */
export const deleteCacheByPattern = async (pattern) => {
  try {
    let cursor = "0";
    let deletedCount = 0;
    const keysToDelete = [];

    // Use SCAN to iterate through keys matching the pattern
    do {
      const [newCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = newCursor;

      if (keys.length > 0) {
        keysToDelete.push(...keys);
      }
    } while (cursor !== "0");

    // Delete all found keys in batches
    if (keysToDelete.length > 0) {
      const pipeline = redis.pipeline();
      keysToDelete.forEach((key) => pipeline.del(key));
      const results = await pipeline.exec();
      deletedCount = results.reduce((sum, [err, count]) => {
        if (err) {
          console.error("Pipeline error:", err.message);
          return sum;
        }
        return sum + (count || 0);
      }, 0);
    }

    return deletedCount;
  } catch (err) {
    console.error(`Cache delete by pattern error for pattern ${pattern}:`, err.message);
    return 0;
  }
};
