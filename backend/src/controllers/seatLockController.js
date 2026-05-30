import * as seatLockService from "../services/seatLockService.js";

/**
 * POST /seats/lock - Lock seats for a show
 */
export const lockSeats = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user.userId; // From auth middleware

    // Validation
    if (!showId) {
      return res.status(400).json({
        success: false,
        message: "showId is required",
      });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "seatIds must be a non-empty array",
      });
    }

    // Call service
    await seatLockService.lockSeats(showId, seatIds, userId);

    // Calculate locked until timestamp (300 seconds = 5 minutes)
    const lockedUntil = Date.now() + 300000;

    return res.status(200).json({
      success: true,
      message: "Seats locked for 5 minutes",
      lockedUntil,
    });
  } catch (error) {
    // Check for specific error codes
    if (error.code === "REDIS_UNAVAILABLE") {
      return res.status(503).json({
        success: false,
        message: "Seat locking service unavailable. Try again shortly.",
      });
    }

    if (error.code === "SEAT_UNAVAILABLE") {
      return res.status(409).json({
        success: false,
        message: error.message,
        unavailableSeats: error.unavailableSeats || [],
      });
    }

    // Pass to error handler
    next(error);
  }
};

/**
 * POST /seats/unlock - Unlock seats for a show
 */
export const unlockSeats = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user.userId; // From auth middleware

    // Validation
    if (!showId) {
      return res.status(400).json({
        success: false,
        message: "showId is required",
      });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "seatIds must be a non-empty array",
      });
    }

    // Call service
    const released = await seatLockService.unlockSeats(showId, seatIds, userId);

    return res.status(200).json({
      success: true,
      released,
    });
  } catch (error) {
    if (error.code === "REDIS_UNAVAILABLE") {
      return res.status(503).json({
        success: false,
        message: "Seat locking service unavailable. Try again shortly.",
      });
    }

    next(error);
  }
};
