import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let channel = null;
let connection = null;

/**
 * Connect to RabbitMQ and assert required queues
 */
const connectToRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Assert durable queues
    await channel.assertQueue('booking.email', { durable: true });
    await channel.assertQueue('booking.analytics', { durable: true });
    await channel.assertQueue('booking.seatRelease', { durable: true });

    console.log('RabbitMQ connected and queues asserted');

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
      channel = null;
      connection = null;
      scheduleReconnect();
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      channel = null;
      connection = null;
      scheduleReconnect();
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    channel = null;
    connection = null;
    scheduleReconnect();
  }
};

/**
 * Schedule reconnection attempt every 5 seconds
 */
const scheduleReconnect = () => {
  setTimeout(() => {
    console.log('Attempting to reconnect to RabbitMQ...');
    connectToRabbitMQ();
  }, 5000);
};

/**
 * Get RabbitMQ channel
 * @returns {Object|null} - channel or null if unavailable
 */
export const getChannel = () => {
  return channel;
};

/**
 * Publish event to RabbitMQ queue
 * @param {string} queue - queue name
 * @param {Object} payload - event payload
 * @returns {boolean} - true if published, false otherwise
 */
export const publishEvent = async (queue, payload) => {
  try {
    if (!channel) {
      console.log(`RabbitMQ unavailable, event lost: ${queue} ${payload.bookingId}`);
      return false;
    }

    const message = Buffer.from(JSON.stringify(payload));
    channel.sendToQueue(queue, message, { persistent: true });
    return true;
  } catch (error) {
    console.error(`Error publishing event to ${queue}:`, error.message);
    return false;
  }
};

// Initialize connection on module load
connectToRabbitMQ();

export default {
  getChannel,
  publishEvent,
};
