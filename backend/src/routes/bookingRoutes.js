import express from "express";
import * as bookingController from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/v1/bookings - Create a new booking
router.post("/", authMiddleware, bookingController.createBooking);

// GET /api/v1/bookings - Get user's booking history
router.get("/", authMiddleware, bookingController.getUserBookings);

// GET /api/v1/bookings/:id - Get booking details by ID
router.get("/:id", authMiddleware, bookingController.getBookingById);

export default router;
