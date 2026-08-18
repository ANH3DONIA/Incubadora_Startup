import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      console.warn('⚠️ Redis unreachable, continuing in degraded memory mode.');
      return null; // Stop retrying
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.warn('⚠️ Redis error:', err.message);
});

// Attempt connection asynchronously
redis.connect().catch((err) => {
  console.warn('⚠️ Redis initial connection failed:', err.message);
});
