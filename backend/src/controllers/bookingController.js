import * as bookingService from "../services/bookingService.js";
import { validate as isUUID } from "uuid";

/**
 * POST /bookings
 * Create a new booking with seat reservation and payment
 */
export const createBooking = async (req, res, next) => {
    try {
        const { showId, seatIds } = req.body;
        const userId = req.user.userId;

        // Validate input
        if (!showId || !isUUID(showId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid showId",
            });
        }

        if (!Array.isArray(seatIds) || seatIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "seatIds must be a non-empty array",
            });
        }

        // Validate all seat IDs are UUIDs
        for (const seatId of seatIds) {
            if (!isUUID(seatId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid seat ID: ${seatId}`,
                });
            }
        }

        const result = await bookingService.createBooking({
            userId,
            showId,
            seatIds,
        });

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        // Handle specific errors
        if (error.code === "SEAT_LOCK_FAILED" || error.code === "SEAT_LOCK_FAILED") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        if (error.code === "SEAT_ALREADY_BOOKED") {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
};

/**
 * GET /bookings
 * Get user's booking history
 */
export const getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const bookings = await bookingService.getUserBookings(userId);

        return res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /bookings/:id
 * Get booking details by ID
 */
export const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!isUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await bookingService.getBookingById(id, userId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};
