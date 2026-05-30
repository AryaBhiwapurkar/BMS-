import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

/**
 * Analytics Worker - Consumes booking.analytics queue
 */
export const startAnalyticsWorker = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue('booking.analytics', { durable: true });
    await channel.prefetch(1);

    console.log('📊 Analytics Worker started, waiting for messages...');

    await channel.consume('booking.analytics', async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { type, bookingId, totalAmount } = payload;

          console.log(`📊 Analytics: ${type} | booking: ${bookingId} | amount: ${totalAmount}`);

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing analytics message:', error.message);
          channel.nack(msg, false, false);
        }
      }
    });

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('Analytics Worker connection error:', err.message);
    });

    connection.on('close', () => {
      console.log('Analytics Worker connection closed');
    });
  } catch (error) {
    console.error('Failed to start Analytics Worker:', error.message);
  }
};
