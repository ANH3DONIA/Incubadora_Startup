import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { AuthRequest } from './auth.middleware.js';

export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    // Audit only state mutations (POST, PUT, PATCH, DELETE) for performance & security compliance
    if (req.method !== 'GET' && req.method !== 'OPTIONS' && req.method !== 'HEAD') {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || null;
      const userAgent = req.get('user-agent') || 'UNKNOWN';
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'UNKNOWN';

      let sanitizedPayload: string | null = null;
      if (req.body && typeof req.body === 'object') {
        try {
          const bodyCopy = { ...req.body };
          if (bodyCopy.password) bodyCopy.password = '[REDACTED]';
          if (bodyCopy.currentPassword) bodyCopy.currentPassword = '[REDACTED]';
          if (bodyCopy.newPassword) bodyCopy.newPassword = '[REDACTED]';
          if (bodyCopy.confirmPassword) bodyCopy.confirmPassword = '[REDACTED]';
          if (bodyCopy.refreshToken) bodyCopy.refreshToken = '[REDACTED]';
          if (bodyCopy.apiKey) bodyCopy.apiKey = '[REDACTED]';
          if (bodyCopy.secret) bodyCopy.secret = '[REDACTED]';
          if (bodyCopy.cvv) bodyCopy.cvv = '[REDACTED]';
          if (bodyCopy.cardNumber) bodyCopy.cardNumber = '[REDACTED]';
          // Omit potential file buffer or large binary fields
          if (bodyCopy.pitchDeck) bodyCopy.pitchDeck = '[FILE_DATA]';
          const raw = JSON.stringify(bodyCopy);
          sanitizedPayload = raw.length > 1000 ? raw.slice(0, 1000) + '... [TRUNCATED]' : raw;
        } catch {
          sanitizedPayload = '[UNSERIALIZABLE_PAYLOAD]';
        }
      }

      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: `${req.method} ${req.originalUrl}`,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            ipAddress: ip.toString(),
            userAgent: userAgent.slice(0, 255),
            requestPayload: sanitizedPayload,
          },
        });
      } catch (error) {
        console.error('⚠️ Error recording audit log:', error);
      }
    }
  });

  next();
};
