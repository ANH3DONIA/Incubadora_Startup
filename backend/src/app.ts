import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Middlewares
import { auditLog } from './middlewares/audit.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

// Route Modules
import authRoutes from './modules/auth/auth.routes.js';
import startupRoutes from './modules/startups/startup.routes.js';
import pitchRoutes from './modules/pitches/pitch.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import matchmakingRoutes from './modules/matchmaking/matchmaking.routes.js';
import calendarRoutes from './modules/calendar/calendar.routes.js';

export const createApp = () => {
  const app = express();

  // Security & Utility Middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Audit Log Middleware
  app.use(auditLog);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/startups', startupRoutes);
  app.use('/api/pitches', pitchRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/matchmaking', matchmakingRoutes);
  app.use('/api/calendar', calendarRoutes);

  // 404 Route
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
