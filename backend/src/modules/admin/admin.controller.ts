import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { sendResponse } from '../../utils/response.js';

const adminService = new AdminService();

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getDashboardStats();
      return sendResponse(res, 200, data);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const data = await adminService.getAllUsers(page, limit);
      return sendResponse(res, 200, data.users, undefined, data.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const adminId = (req as any).user?.id;
      const user = await adminService.updateUserStatus(req.params.id as string, isActive, adminId);
      return sendResponse(res, 200, user, 'Estado de usuario actualizado');
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const data = await adminService.getAuditLogs(page, limit);
      return sendResponse(res, 200, data.logs, undefined, data.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getFinances(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getFinances();
      return sendResponse(res, 200, data);
    } catch (error) {
      next(error);
    }
  }
}
