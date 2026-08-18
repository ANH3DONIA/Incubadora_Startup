import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/error.js';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('No autorizado, token faltante', 401));
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_ACCESS_SECRET no configurada en producción');
    }
    const jwtSecret = secret || 'dev-jwt-access-secret-key-32-chars-long-min';

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return next(new AppError('Usuario no encontrado o inactivo', 401));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    next();
  } catch (error) {
    next(new AppError('Token inválido o expirado', 401));
  }
};
