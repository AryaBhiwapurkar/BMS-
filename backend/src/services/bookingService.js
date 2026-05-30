import { pool } from "../config/database.js";
import redis from "../config/redis.js";
import * as bookingRepository from "../repositories/bookingRepository.js";
import { deleteCache } from "./cacheService.js";
import { publishEvent } from "../config/rabbitmq.js";

/**
 * Create booking with atomic transaction:
 * 1. Verify seats are locked in Redis
 * 2. Verify seats are not already booked in DB
 * 3. Calculate total amount
 * 4. Execute atomic transaction (create booking, reserve seats, create payment, confirm booking)
 * 5. Unlock seats in Redis
 * 6. Invalidate cache
 */
export const createBooking = async ({ userId, showId, seatIds }) => {
  // Step 1: Verify all seatIds are locked in Redis by this user
  console.log("Transaction Step 1: Verifying seat locks...");
  for (const seatId of seatIds) {
    const lockKey = `seat_lock:${showId}:${seatId}`;
    const lockOwner = await redis.get(lockKey);
    if (lockOwner !== userId) {
      const error = new Error("Seats not locked or lock expired");
      error.code = "SEAT_LOCK_FAILED";
      error.statusCode = 400;
      throw error;
    }
  }

  // Step 2: Verify seats are not already booked in DB
  console.log("Transaction Step 2: Verifying seats availability in DB...");
  const bookedSeats = await bookingRepository.checkSeatsAlreadyBooked(showId, seatIds);
  if (bookedSeats.length > 0) {
    const error = new Error("Seats already booked");
    error.code = "SEAT_ALREADY_BOOKED";
    error.statusCode = 409;
    throw error;
  }

  // Step 3: Calculate total amount
  console.log("Transaction Step 3: Fetching show price...");
  const showData = await bookingRepository.getShowPricing(showId);
  if (!showData) {
    const error = new Error("Show not found");
    error.statusCode = 404;
    throw error;
  }
  const showPricing = showData.pricing;
  const pricePerSeat = showPricing && showPricing.standard ? showPricing.standard : 100; // Default to 100 if not set
  const totalAmount = pricePerSeat * seatIds.length;

  // Step 4: Atomic PostgreSQL transaction
  const client = await pool.connect();
  try {
    console.log("Transaction started");
    await client.query("BEGIN");

    // Create booking
    const booking = await bookingRepository.createBooking(client, {
      userId,
      showId,
      totalAmount,
    });
    console.log(`Booking created: ${booking.id}`);

    // Reserve seats
    const bookedSeatsData = await bookingRepository.reserveSeats(client, {
      bookingId: booking.id,
      showId,
      seatIds,
      price: pricePerSeat,
    });
    console.log(`Seats reserved: ${bookedSeatsData.length} seats`);

    // Create payment
    const payment = await bookingRepository.createPayment(client, {
      bookingId: booking.id,
      amount: totalAmount,
    });
    console.log(`Payment created: ${payment.id}`);

    // Confirm booking (mock payment - immediately confirm)
    const confirmedBooking = await bookingRepository.confirmBooking(client, booking.id);
    console.log(`Booking confirmed: ${confirmedBooking.id}`);

    // Confirm payment (mock payment - immediately confirm)
    const confirmedPayment = await bookingRepository.confirmPayment(client, payment.id);
    console.log(`Payment confirmed: ${confirmedPayment.id}`);

    await client.query("COMMIT");
    console.log("Transaction committed (COMMIT)");

    // Publish events
    await publishEvent('booking.email', {
      type: 'BOOKING_CONFIRMED',
      bookingId: booking.id,
      userId,
      showId,
      seatIds,
      totalAmount,
      timestamp: Date.now(),
    });
    await publishEvent('booking.analytics', {
      type: 'BOOKING_CREATED',
      bookingId: booking.id,
      userId,
      showId,
      totalAmount,
      timestamp: Date.now(),
    });

    // Step 5: Unlock seats in Redis after successful booking
    console.log("Transaction Step 5: Unlocking seats in Redis...");
    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    for (const seatId of seatIds) {
      const lockKey = `seat_lock:${showId}:${seatId}`;
      await redis.eval(luaScript, 1, lockKey, userId);
    }

    // Step 6: Invalidate cache
    console.log("Transaction Step 6: Invalidating cache...");
    await deleteCache(`show_seats:${showId}`);

    return {
      booking: confirmedBooking,
      payment: confirmedPayment,
      bookedSeats: bookedSeatsData,
    };
  } catch (error) {
    console.error("Transaction error:", error.message);
    await client.query("ROLLBACK");
    console.log("Transaction rolled back (ROLLBACK)");
    throw error;
  } finally {
    client.release();
    console.log("Transaction client released");
  }
};

/**
 * Get user's booking history
 */
export const getUserBookings = async (userId) => {
  return await bookingRepository.getUserBookings(userId);
};

/**
 * Get booking details by ID
 */
export const getBookingById = async (bookingId, userId) => {
  return await bookingRepository.getBookingById(bookingId, userId);
};
