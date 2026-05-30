import amqp from 'amqplib';
import dotenv from 'dotenv';
import { pool } from '../config/database.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

/**
 * Seat Release Worker - Consumes booking.seatRelease queue
 */
export const startSeatReleaseWorker = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue('booking.seatRelease', { durable: true });
    await channel.prefetch(1);

    console.log('🔓 Seat Release Worker started, waiting for messages...');

    await channel.consume('booking.seatRelease', async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { type, bookingId, showId, seatIds } = payload;

          if (type === 'BOOKING_CANCELLED') {
            // Delete booked seats for this booking
            await pool.query(
              'DELETE FROM booked_seats WHERE booking_id = $1',
              [bookingId]
            );

            // Update booking status to cancelled
            await pool.query(
              `UPDATE bookings SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
              [bookingId]
            );

            console.log(`🔓 Released seats for cancelled booking ${bookingId}`);
          }

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing seat release message:', error.message);
          channel.nack(msg, false, false);
        }
      }
    });

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('Seat Release Worker connection error:', err.message);
    });

    connection.on('close', () => {
      console.log('Seat Release Worker connection closed');
    });
  } catch (error) {
    console.error('Failed to start Seat Release Worker:', error.message);
  }
};
