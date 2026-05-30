import { startEmailWorker } from '../workers/emailWorker.js';
import { startAnalyticsWorker } from '../workers/analyticsWorker.js';
import { startSeatReleaseWorker } from '../workers/seatReleaseWorker.js';

/**
 * Start all workers
 */
export const startWorkers = async () => {
  try {
    console.log('Starting workers...');

    // Start email worker
    (async () => {
      try {
        await startEmailWorker();
      } catch (error) {
        console.error('Email Worker error:', error.message);
      }
    })();

    // Start analytics worker
    (async () => {
      try {
        await startAnalyticsWorker();
      } catch (error) {
        console.error('Analytics Worker error:', error.message);
      }
    })();

    // Start seat release worker
    (async () => {
      try {
        await startSeatReleaseWorker();
      } catch (error) {
        console.error('Seat Release Worker error:', error.message);
      }
    })();

    console.log('All workers started');
  } catch (error) {
    console.error('Error starting workers:', error.message);
  }
};
