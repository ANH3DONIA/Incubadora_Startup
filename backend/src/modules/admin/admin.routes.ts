import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/finances', AdminController.getFinances);

export default router;
