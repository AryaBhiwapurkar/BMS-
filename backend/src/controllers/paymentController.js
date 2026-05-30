import { pool } from "../config/database.js";
import { validate as isUUID } from "uuid";
import { publishEvent } from "../config/rabbitmq.js";

/**
 * POST /payments/mock
 * Mock payment processing with success/failure simulation
 * Body: { bookingId, simulateFailure: false }
 */
export const mockPayment = async (req, res, next) => {
  try {
    const { bookingId, simulateFailure = false } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!bookingId || !isUUID(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bookingId",
      });
    }

    // Verify booking exists and belongs to user
    const bookingResult = await pool.query(
      `SELECT id, status FROM bookings WHERE id = $1 AND user_id = $2`,
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or does not belong to this user",
      });
    }

    const booking = bookingResult.rows[0];

    // Get payment associated with booking
    const paymentResult = await pool.query(
      `SELECT id FROM payments WHERE booking_id = $1`,
      [bookingId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this booking",
      });
    }

    const payment = paymentResult.rows[0];
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      if (simulateFailure) {
        // Payment failure scenario
        await client.query(
          `UPDATE payments SET status = 'FAILED' WHERE id = $1`,
          [payment.id]
        );
        await client.query(
          `UPDATE bookings SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [bookingId]
        );
        await client.query("COMMIT");

        // Before publishing the cancelled event, fetch the booking details first
        const bookingDetailsResult = await pool.query(
          `SELECT b.show_id, bs.seat_id FROM bookings b JOIN booked_seats bs ON b.id = bs.booking_id WHERE b.id = $1`,
          [bookingId]
        );

        const showId = bookingDetailsResult.rows[0]?.show_id;
        const seatIds = bookingDetailsResult.rows.map(row => row.seat_id);

        await publishEvent('booking.seatRelease', {
          type: 'BOOKING_CANCELLED',
          bookingId,
          showId,
          seatIds,
          timestamp: Date.now(),
        });
        await publishEvent('booking.analytics', {
          type: 'BOOKING_CANCELLED',
          bookingId,
          timestamp: Date.now(),
        });

        return res.status(200).json({
          success: true,
          status: "failed",
          message: "Payment simulation failed",
        });
      } else {
        // Payment success scenario
        await client.query(
          `UPDATE payments SET status = 'SUCCESS' WHERE id = $1`,
          [payment.id]
        );
        await client.query(
          `UPDATE bookings SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [bookingId]
        );
        await client.query("COMMIT");

        // Publish events for payment success
        const paymentResult = await pool.query(
          `SELECT amount FROM payments WHERE booking_id = $1`,
          [bookingId]
        );
        const amount = paymentResult.rows[0]?.amount;

        await publishEvent('booking.email', {
          type: 'PAYMENT_SUCCESS',
          bookingId,
          userId,
          amount,
          timestamp: Date.now(),
        });
        await publishEvent('booking.analytics', {
          type: 'PAYMENT_SUCCESS',
          bookingId,
          amount,
          timestamp: Date.now(),
        });

        return res.status(200).json({
          success: true,
          status: "success",
          message: "Payment successful",
        });
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};
