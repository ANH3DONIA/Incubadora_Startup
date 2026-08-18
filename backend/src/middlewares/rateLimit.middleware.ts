import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { AppError } from '../utils/error.js';

interface RateLimitOptions {
  windowMs: number; // Duration of window in milliseconds
  max: number; // Max requests allowed per window
  message?: string;
  prefix?: string;
}

// In-memory fallback storage when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Periodic cleanup for in-memory store
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 60_000);

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde.',
    prefix = 'rl',
  } = options;

  const windowSec = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${prefix}:${ip.toString().replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    // Try Redis first
    try {
      if (redis.status === 'ready' || redis.status === 'connect') {
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, windowSec);
        }

        const ttl = await redis.ttl(key);
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
        res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

        if (current > max) {
          res.setHeader('Retry-After', ttl);
          return next(new AppError(message, 429, { retryAfterSeconds: ttl }));
        }

        return next();
      }
    } catch (redisErr) {
      // Fallback to in-memory mode seamlessly
    }

    // In-memory Fallback
    const now = Date.now();
    const existing = memoryStore.get(key);

    if (!existing || now > existing.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    existing.count += 1;
    const remainingTimeSec = Math.ceil((existing.resetTime - now) / 1000);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - existing.count));

    if (existing.count > max) {
      res.setHeader('Retry-After', remainingTimeSec);
      return next(new AppError(message, 429, { retryAfterSeconds: remainingTimeSec }));
    }

    next();
  };
};

// Standard limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  prefix: 'auth',
  message: 'Demasiados intentos de autenticación. Cuenta temporalmente protegida por 15 minutos.',
});

export const passwordChangeLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  prefix: 'pwd_change',
  message: 'Límite de cambios de contraseña excedido. Intenta en 1 hora.',
});

export const roomLookupLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 25,
  prefix: 'room_lookup',
  message: 'Demasiadas consultas de salas de pitch. Por favor espera 1 minuto.',
});
