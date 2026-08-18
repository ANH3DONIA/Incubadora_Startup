import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createSubscriptionSchema,
  createCryptoSubscriptionSchema,
  createInvestmentSchema,
  createCryptoInvestmentSchema,
  confirmSandboxSchema,
} from './payment.schema.js';

const router = Router();

// ============================================================================
// WEBHOOK PÚBLICO (Firma Criptográfica)
// ============================================================================
router.post('/webhook', PaymentController.stripeWebhook);

// ============================================================================
// MEMBRESÍAS Y PLANES (PRO $49 / ENTERPRISE $249)
// ============================================================================
router.post(
  '/subscriptions/checkout',
  authenticate,
  validateRequest(createSubscriptionSchema),
  PaymentController.createSubscriptionCheckout
);

router.post(
  '/subscriptions/crypto',
  authenticate,
  validateRequest(createCryptoSubscriptionSchema),
  PaymentController.createCryptoSubscription
);

router.post(
  '/subscriptions/cancel',
  authenticate,
  PaymentController.cancelSubscription
);

// ============================================================================
// INVERSIONES DE CAPITAL EN STARTUPS ($50 A $10,000,000 USD)
// ============================================================================
router.post(
  '/investments/checkout',
  authenticate,
  validateRequest(createInvestmentSchema),
  PaymentController.createInvestmentCheckout
);

router.post(
  '/investments/crypto',
  authenticate,
  validateRequest(createCryptoInvestmentSchema),
  PaymentController.createCryptoInvestment
);

// ============================================================================
// SIMULACIÓN SANDBOX (Desarrollo) & HISTORIAL
// ============================================================================
router.post(
  '/confirm-sandbox',
  authenticate,
  validateRequest(confirmSandboxSchema),
  PaymentController.confirmSandbox
);

router.get('/my-investments', authenticate, PaymentController.getMyInvestments);

export default router;
