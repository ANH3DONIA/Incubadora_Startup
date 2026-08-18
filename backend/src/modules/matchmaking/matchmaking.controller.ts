import { Request, Response, NextFunction } from 'express';
import { MatchmakingService } from './matchmaking.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { sendResponse } from '../../utils/response.js';

const matchmakingService = new MatchmakingService();

export class MatchmakingController {
  static async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await matchmakingService.getPreferences(req.user!.id);
      return sendResponse(res, 200, prefs);
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await matchmakingService.updatePreferences(req.user!.id, req.body);
      return sendResponse(res, 200, prefs, 'Preferencias de matchmaking actualizadas');
    } catch (error) {
      next(error);
    }
  }

  static async getMatches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const matches = await matchmakingService.getMatches(req.user!.id);
      return sendResponse(res, 200, matches);
    } catch (error) {
      next(error);
    }
  }
}
