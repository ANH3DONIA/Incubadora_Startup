import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';
    error = new AppError(message, statusCode, error.details || error.stack);
  }

  const statusCode = error.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  if (statusCode >= 500) {
    console.error('💥 [Server Error]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(error.details ? { errors: error.details } : {}),
    ...(isDev && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};
