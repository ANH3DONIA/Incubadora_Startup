import Redis from 'ioredis';

let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Auto-corrección si la URL de Upstash quedó truncada en variables de entorno de la nube
if (redisUrl.includes('mature-minnow-169509.') && !redisUrl.includes('upstash.io')) {
  redisUrl = redisUrl.replace('mature-minnow-169509.', 'mature-minnow-169509.upstash.io:6379');
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      console.warn('⚠️ Redis unreachable, continuing in degraded memory mode.');
      return null;
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

redis.connect().catch((err) => {
  console.warn('⚠️ Redis initial connection failed:', err.message);
});
