import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AppError } from '../utils/error.js';
import { UserRole } from '@prisma/client';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos suficientes para realizar esta acción', 403));
    }

    next();
  };
};
