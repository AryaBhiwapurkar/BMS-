import redis from "../config/redis.js";

/**
 * Lock seats for a show
 * @param {string} showId - Show ID
 * @param {string[]} seatIds - Array of seat IDs to lock
 * @param {string} userId - User ID (owner of the lock)
 * @returns {Promise<boolean>} - true if all seats locked successfully
 * @throws {Error} - if any seat fails to lock or Redis is unavailable
 */
export const lockSeats = async (showId, seatIds, userId) => {
  const lockedSeats = [];
  const failedSeats = [];

  try {
    // Try to lock each seat
    for (const seatId of seatIds) {
      const lockKey = `seat_lock:${showId}:${seatId}`;
      // SET key userId NX EX 300 (5 minutes TTL)
      const result = await redis.set(lockKey, userId, "NX", "EX", 300);

      if (result === "OK") {
        lockedSeats.push(seatId);
      } else {
        failedSeats.push(seatId);
      }
    }

    // If any seat failed to lock, release all acquired locks
    if (failedSeats.length > 0) {
      await unlockSeats(showId, lockedSeats, userId);
      const error = new Error(`Seats not available: ${failedSeats.join(", ")}`);
      error.code = "SEAT_UNAVAILABLE";
      error.unavailableSeats = failedSeats;
      throw error;
    }

    return true;
  } catch (err) {
    // Check if it's a connection error
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("ENOTFOUND") ||
      err.message.includes("connect")
    ) {
      const redisError = new Error("Redis service unavailable");
      redisError.code = "REDIS_UNAVAILABLE";
      throw redisError;
    }
    throw err;
  }
};

/**
 * Unlock seats for a show (only if they're owned by userId)
 * @param {string} showId - Show ID
 * @param {string[]} seatIds - Array of seat IDs to unlock
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<number>} - count of successfully released locks
 */
export const unlockSeats = async (showId, seatIds, userId) => {
  try {
    let releasedCount = 0;

    // Lua script for atomic delete (only if value matches userId)
    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    // Delete each key only if the value matches userId
    for (const seatId of seatIds) {
      const lockKey = `seat_lock:${showId}:${seatId}`;
      const result = await redis.eval(luaScript, 1, lockKey, userId);
      if (result === 1) {
        releasedCount++;
      }
    }

    return releasedCount;
  } catch (err) {
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("ENOTFOUND") ||
      err.message.includes("connect")
    ) {
      const redisError = new Error("Redis service unavailable");
      redisError.code = "REDIS_UNAVAILABLE";
      throw redisError;
    }
    throw err;
  }
};
