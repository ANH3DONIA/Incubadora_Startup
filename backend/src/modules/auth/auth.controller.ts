import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { sendResponse } from '../../utils/response.js';

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return sendResponse(res, 201, result, 'Usuario registrado con éxito');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return sendResponse(res, 200, result, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      return sendResponse(res, 200, result, 'Tokens renovados correctamente');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      return sendResponse(res, 200, req.user);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      return sendResponse(res, 200, null, 'Sesión cerrada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.getProfile(req.user!.id);
      return sendResponse(res, 200, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.updateProfile(req.user!.id, req.body);
      return sendResponse(res, 200, result, 'Perfil actualizado con éxito');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.user!.id, req.body);
      return sendResponse(res, 200, null, 'Contraseña actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

