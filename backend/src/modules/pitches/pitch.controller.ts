import { Request, Response, NextFunction } from 'express';
import { PitchService } from './pitch.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { sendResponse } from '../../utils/response.js';

const pitchService = new PitchService();

export class PitchController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await pitchService.createSession(
        req.body,
        req.user!.id,
        req.user!.role
      );
      return sendResponse(res, 201, session, 'Sesión de pitch programada con éxito');
    } catch (error) {
      next(error);
    }
  }

  static async getUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await pitchService.getUpcomingSessions();
      return sendResponse(res, 200, sessions);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await pitchService.getSessionById(req.params.id as string);
      return sendResponse(res, 200, session);
    } catch (error) {
      next(error);
    }
  }

  static async getRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await pitchService.getRoomByCodeOrId(req.params.roomId as string);
      return sendResponse(res, 200, room);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await pitchService.updateStatus(
        req.params.id as string,
        req.body.status,
        req.user!.id,
        req.user!.role
      );
      return sendResponse(res, 200, session, 'Estado de pitch actualizado');
    } catch (error) {
      next(error);
    }
  }

  static async getMyPitches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pitches = await pitchService.getMyStartupPitches(req.user!.id);
      return sendResponse(res, 200, pitches);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await pitchService.updateSession(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.role
      );
      return sendResponse(res, 200, session, 'Sesión de pitch actualizada');
    } catch (error) {
      next(error);
    }
  }

  static async rateStartup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rating = await pitchService.rateStartup(
        req.params.startupId as string,
        req.user!.id,
        req.body
      );
      return sendResponse(res, 200, rating, 'Calificación guardada');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await pitchService.deleteSession(
        req.params.id as string,
        req.user!.id,
        req.user!.role
      );
      return sendResponse(res, 200, null, 'Sesión de pitch eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

