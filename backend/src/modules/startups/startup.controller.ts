import { Request, Response, NextFunction } from 'express';
import { StartupService } from './startup.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../utils/error.js';

const startupService = new StartupService();

export class StartupController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startup = await startupService.create(req.body, req.user!.id);
      return sendResponse(res, 201, startup, 'Startup creada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await startupService.findAll(req.query);
      return sendResponse(res, 200, result.startups, undefined, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const startup = await startupService.findById(req.params.id as string);
      return sendResponse(res, 200, startup);
    } catch (error) {
      next(error);
    }
  }

  static async getMyStartup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startup = await startupService.getMyStartup(req.user!.id);
      return sendResponse(res, 200, startup);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startup = await startupService.update(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.role
      );
      return sendResponse(res, 200, startup, 'Startup actualizada correctamente');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await startupService.delete(req.params.id as string, req.user!.id, req.user!.role);
      return sendResponse(res, 200, null, 'Startup eliminada');
    } catch (error) {
      next(error);
    }
  }

  static async uploadPitchDeck(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No se proporcionó ningún archivo PDF', 400);
      }

      const startup = await startupService.uploadPitchDeck(
        req.params.id as string,
        req.user!.id,
        req.file.buffer,
        req.file.originalname
      );

      return sendResponse(res, 200, startup, 'Pitch deck cifrado y guardado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  static async getPitchDeckFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const decryptedPdf = await startupService.getDecryptedPitchDeck(
        req.params.id as string,
        req.user!.id,
        req.user!.role
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="pitch-deck-${req.params.id}.pdf"`);
      return res.send(decryptedPdf);
    } catch (error) {
      next(error);
    }
  }
}
