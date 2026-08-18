import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { createCheckoutSchema, createCryptoOrderSchema } from './payment.schema.js';

const router = Router();

// Webhook endpoint (public with cryptographic signature verification)
router.post('/webhook', PaymentController.stripeWebhook);

router.post(
  '/checkout',
  authenticate,
  validateRequest(createCheckoutSchema),
  PaymentController.createCheckout
);

router.post(
  '/crypto/create-order',
  authenticate,
  validateRequest(createCryptoOrderSchema),
  PaymentController.createCryptoOrder
);

// Sandbox manual confirm strictly protected for ADMIN in development
router.post(
  '/confirm-sandbox',
  authenticate,
  authorize('ADMIN'),
  PaymentController.confirmSandbox
);

router.get('/my-investments', authenticate, PaymentController.getMyInvestments);

export default router;

