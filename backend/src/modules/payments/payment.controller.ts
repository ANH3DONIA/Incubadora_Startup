import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { sendResponse } from '../../utils/response.js';

const paymentService = new PaymentService();

export class PaymentController {
  // ==========================================================================
  // MEMBRESÍAS Y SUSCRIPCIONES
  // ==========================================================================

  static async createSubscriptionCheckout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.createSubscriptionCheckout(req.body, req.user!.id);
      return sendResponse(res, 200, result, 'Sesión de suscripción creada');
    } catch (error) {
      next(error);
    }
  }

  static async createCryptoSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.createCryptoSubscriptionOrder(req.body, req.user!.id);
      return sendResponse(res, 200, result, 'Orden de suscripción Binance Pay generada');
    } catch (error) {
      next(error);
    }
  }

  static async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.cancelSubscription(req.user!.id);
      return sendResponse(res, 200, result, 'Suscripción cancelada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // INVERSIONES EN STARTUPS
  // ==========================================================================

  static async createInvestmentCheckout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.createInvestmentCheckout(req.body, req.user!.id);
      return sendResponse(res, 200, result, 'Sesión de checkout de inversión creada');
    } catch (error) {
      next(error);
    }
  }

  static async createCryptoInvestment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.createCryptoInvestmentOrder(req.body, req.user!.id);
      return sendResponse(res, 200, result, 'Orden de inversión Binance Pay generada');
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // SANDBOX & TRANSACCIONES
  // ==========================================================================

  static async confirmSandbox(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { transactionHash } = req.body;
      const result = await paymentService.confirmInvestmentSandbox(
        transactionHash,
        req.user?.id,
        req.user?.role
      );
      return sendResponse(res, 200, result, 'Transacción confirmada (Sandbox)');
    } catch (error) {
      next(error);
    }
  }

  static async getMyInvestments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const investments = await paymentService.getMyInvestments(req.user!.id);
      return sendResponse(res, 200, investments);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // WEBHOOK DE STRIPE
  // ==========================================================================

  static async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const stripeKey = process.env.STRIPE_SECRET_KEY;

      let event: any;

      // Modo producción / con claves reales: verificar firma criptográfica
      if (webhookSecret && sig && (req as any).rawBody && stripeKey && !stripeKey.includes('mock')) {
        try {
          const { default: Stripe } = await import('stripe');
          const stripeClient = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
          event = stripeClient.webhooks.constructEvent((req as any).rawBody, sig, webhookSecret);
        } catch (err: any) {
          console.error('⚠️ [Stripe Webhook Signature Verification Failed]:', err.message);
          return res.status(400).send(`Webhook Signature Error: ${err.message}`);
        }
      } else {
        // Modo simulado / desarrollo académico: aceptar el body directamente
        if (process.env.NODE_ENV === 'production' && stripeKey && !stripeKey.includes('mock')) {
          return res.status(400).json({ error: 'Firma de webhook de Stripe requerida en producción' });
        }
        event = req.body;
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await paymentService.processSuccessfulStripePayment(
          session.id,
          session.client_reference_id,
          session.amount_total,
          session.metadata
        );
      }
      return res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}
