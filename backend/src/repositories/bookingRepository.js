import { pool } from "../config/database.js";
import { v4 as uuid } from "uuid";

/**
 * Create a booking record in DB (requires transaction client)
 * @param {pg.PoolClient} client - Active DB client for transaction
 * @param {Object} bookingData - { userId, showId, totalAmount }
 * @returns {Promise<Object>} Created booking row
 */
export const createBooking = async (client, { userId, showId, totalAmount }) => {
  const bookingId = uuid();
  const result = await client.query(
    `
    INSERT INTO bookings (id, user_id, show_id, total_amount, status)
    VALUES ($1, $2, $3, $4, 'PENDING')
    RETURNING *
    `,
    [bookingId, userId, showId, totalAmount]
  );
  return result.rows[0];
};

/**
 * Reserve seats for a booking (requires transaction client)
 * @param {pg.PoolClient} client - Active DB client for transaction
 * @param {Object} seatData - { bookingId, showId, seatIds, price }
 * @returns {Promise<Object[]>} Inserted booked_seats rows
 */
export const reserveSeats = async (client, { bookingId, showId, seatIds, price }) => {
  const bookedSeats = [];
  for (const seatId of seatIds) {
    const bookedSeatId = uuid();
    const result = await client.query(
      `
      INSERT INTO booked_seats (id, booking_id, show_id, seat_id, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [bookedSeatId, bookingId, showId, seatId, price]
    );
    bookedSeats.push(result.rows[0]);
  }
  return bookedSeats;
};

/**
 * Create a payment record in DB (requires transaction client)
 * @param {pg.PoolClient} client - Active DB client for transaction
 * @param {Object} paymentData - { bookingId, amount }
 * @returns {Promise<Object>} Created payment row
 */
export const createPayment = async (client, { bookingId, amount }) => {
  const paymentId = uuid();
  const result = await client.query(
    `
    INSERT INTO payments (id, booking_id, amount, status)
    VALUES ($1, $2, $3, 'PENDING')
    RETURNING *
    `,
    [paymentId, bookingId, amount]
  );
  return result.rows[0];
};

/**
 * Mark booking as confirmed (requires transaction client)
 * @param {pg.PoolClient} client - Active DB client for transaction
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Updated booking row
 */
export const confirmBooking = async (client, bookingId) => {
  const result = await client.query(
    `
    UPDATE bookings
    SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [bookingId]
  );
  return result.rows[0];
};

/**
 * Mark payment as successful (requires transaction client)
 * @param {pg.PoolClient} client - Active DB client for transaction
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Updated payment row
 */
export const confirmPayment = async (client, paymentId) => {
  const result = await client.query(
    `
    UPDATE payments
    SET status = 'SUCCESS'
    WHERE id = $1
    RETURNING *
    `,
    [paymentId]
  );
  return result.rows[0];
};

/**
 * Get all bookings for a user with show/movie details
 * @param {string} userId - User ID
 * @returns {Promise<Object[]>} User's bookings with details
 */
export const getUserBookings = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.user_id,
      b.show_id,
      b.total_amount,
      b.status,
      b.created_at,
      m.title AS movie_title,
      s.show_time,
      s.pricing
    FROM bookings b
    JOIN shows s ON b.show_id = s.id
    JOIN movies m ON s.movie_id = m.id
    WHERE b.user_id = $1
    ORDER BY b.created_at DESC
    `,
    [userId]
  );
  return result.rows;
};

/**
 * Get a booking by ID with full details (seats, theatre, payment)
 * @param {string} bookingId - Booking ID
 * @param {string} userId - User ID (for security check)
 * @returns {Promise<Object|null>} Booking with all details or null
 */
export const getBookingById = async (bookingId, userId) => {
  try {
    console.log(`[getBookingById] Fetching booking ${bookingId} for user ${userId}`);
    const result = await pool.query(
      `
      SELECT
        b.id,
        b.user_id,
        b.show_id,
        b.total_amount,
        b.status AS booking_status,
        b.created_at,
        m.title AS movie_title,
        s.show_time,
        s.pricing,
        t.name AS theatre_name,
        sc.name AS screen_name,
        COALESCE(
          json_agg(
            json_build_object(
              'seat_id', seat.id,
              'seat_number', seat.seat_number,
              'row', seat.row,
              'column', seat.seat_column
            )
            ORDER BY seat.row, seat.seat_column
          ) FILTER (WHERE seat.id IS NOT NULL),
          '[]'::json
        ) AS seats,
        p.status AS payment_status,
        p.amount AS payment_amount
      FROM bookings b
      JOIN shows s ON b.show_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN screens sc ON s.screen_id = sc.id
      JOIN theatres t ON sc.theatre_id = t.id
      LEFT JOIN booked_seats bs ON b.id = bs.booking_id
      LEFT JOIN seats seat ON bs.seat_id = seat.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.id = $1 AND b.user_id = $2
      GROUP BY b.id, b.user_id, b.show_id, b.total_amount, b.status, b.created_at, m.title, s.show_time, s.pricing, t.name, sc.name, p.status, p.amount
      `,
      [bookingId, userId]
    );
    console.log(`[getBookingById] Query successful, rows: ${result.rows.length}`);
    return result.rows[0] || null;
  } catch (err) {
    console.error('[getBookingById] Query failed:', err.message);
    console.error('[getBookingById] Query details:', err);
    throw err;
  }
};

/**
 * Get booked seat IDs for a show
 * @param {string} show_id - Show ID
 * @returns {Promise<Object[]>} Array of booked seat objects
 */
export const getBookedSeatIds = async (show_id) => {
  const result = await pool.query(
    `
    SELECT seat_id FROM booked_seats
    WHERE show_id = $1
    `,
    [show_id]
  );
  return result.rows;
};

/**
 * Check if specific seats are already booked for a show
 * @param {string} showId - Show ID
 * @param {string[]} seatIds - Array of seat IDs
 * @returns {Promise<Object[]>} Already booked seats
 */
export const checkSeatsAlreadyBooked = async (showId, seatIds) => {
  const result = await pool.query(
    `
    SELECT seat_id FROM booked_seats
    WHERE show_id = $1 AND seat_id = ANY($2)
    `,
    [showId, seatIds]
  );
  return result.rows;
};

/**
 * Get show pricing
 * @param {string} showId - Show ID
 * @returns {Promise<Object|null>} Show pricing object or null
 */
export const getShowPricing = async (showId) => {
  const result = await pool.query(`SELECT pricing FROM shows WHERE id = $1`, [showId]);
  return result.rows[0] || null;
};