import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { authLimiter, passwordChangeLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/refresh', authLimiter, validateRequest(refreshSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), AuthController.updateProfile);
router.post('/change-password', authenticate, passwordChangeLimiter, validateRequest(changePasswordSchema), AuthController.changePassword);

export default router;

