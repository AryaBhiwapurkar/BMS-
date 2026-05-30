import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

/**
 * Email Worker - Consumes booking.email queue
 */
export const startEmailWorker = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue('booking.email', { durable: true });
    await channel.prefetch(1);

    console.log('📧 Email Worker started, waiting for messages...');

    await channel.consume('booking.email', async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { type, bookingId, userId } = payload;

          if (type === 'BOOKING_CONFIRMED') {
            console.log(`📧 Sending confirmation email for booking ${bookingId} to user ${userId}`);
          } else if (type === 'PAYMENT_SUCCESS') {
            console.log(`📧 Payment receipt email for booking ${bookingId}`);
          }

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing email message:', error.message);
          channel.nack(msg, false, false);
        }
      }
    });

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('Email Worker connection error:', err.message);
    });

    connection.on('close', () => {
      console.log('Email Worker connection closed');
    });
  } catch (error) {
    console.error('Failed to start Email Worker:', error.message);
  }
};
