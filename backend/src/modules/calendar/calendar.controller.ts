import { Request, Response, NextFunction } from 'express';
import { CalendarService } from './calendar.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { sendResponse } from '../../utils/response.js';

const calendarService = new CalendarService();

export class CalendarController {
  static async getMyEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await calendarService.getMyEvents(req.user!.id);
      return sendResponse(res, 200, events);
    } catch (error) {
      next(error);
    }
  }

  static async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await calendarService.getAllPublicEvents();
      return sendResponse(res, 200, events);
    } catch (error) {
      next(error);
    }
  }

  static async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await calendarService.createEvent(req.user!.id, req.body);
      return sendResponse(res, 201, event, 'Evento creado');
    } catch (error) {
      next(error);
    }
  }

  static async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await calendarService.deleteEvent(req.params.id as string, req.user!.id, req.user!.role);
      return sendResponse(res, 200, null, 'Evento eliminado');
    } catch (error) {
      next(error);
    }
  }
}
