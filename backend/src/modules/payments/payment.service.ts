import crypto from 'crypto';
import Stripe from 'stripe';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/error.js';
import {
  CreateSubscriptionDto,
  CreateCryptoSubscriptionDto,
  CreateInvestmentDto,
  CreateCryptoInvestmentDto,
} from './payment.schema.js';
import { Prisma, SubscriptionPlan } from '@prisma/client';

export const SUBSCRIPTION_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 días de vigencia

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia' as any,
});

const getFrontendBaseUrl = (providedUrl?: string): string => {
  if (providedUrl) {
    try {
      return new URL(providedUrl).origin;
    } catch {
      // fallback
    }
  }
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const origins = corsOrigin.split(',').map((o) => o.trim().replace(/\/$/, ''));
  return origins.find((o) => o.startsWith('https://')) || origins[0] || 'http://localhost:3000';
};

export class PaymentService {
  // ==========================================================================
  // 1. MEMBRESÍAS Y SUSCRIPCIONES (PRO $49 / ENTERPRISE $249)
  // ==========================================================================

  async createSubscriptionCheckout(data: CreateSubscriptionDto, userId: string) {
    const baseUrl = getFrontendBaseUrl(data.successUrl || data.cancelUrl);
    const successUrl = data.successUrl || `${baseUrl}/settings?subscription=success`;
    const cancelUrl = data.cancelUrl || `${baseUrl}/pricing?subscription=cancelled`;

    // Precios autoritativos en Backend (Blindaje anti-tampering)
    const planAmounts: Record<string, number> = {
      PRO: 49,
      ENTERPRISE: 249,
    };
    const amount = planAmounts[data.plan] || 49;
    const amountInCents = amount * 100;

    // Entorno Sandbox / Desarrollo sin claves reales
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
      const mockSessionId = `sub_mock_${crypto.randomBytes(12).toString('hex')}`;
      
      // En modo prueba, activar inmediatamente la suscripción en base de datos para el usuario
      await this.activateSubscriptionInDb(userId, data.plan);

      return {
        url: `${successUrl}&session_id=${mockSessionId}&mock=true&plan=${data.plan}`,
        sessionId: mockSessionId,
        plan: data.plan,
        amount,
      };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: data.plan === 'ENTERPRISE' ? 'Membresía VC & Fund Suite' : 'Membresía Pro Incubator',
                description: 'Acceso ilimitado a Quick Pitches, Pitch Decks cifrados y Deal Flow',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}&plan=${data.plan}`,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          type: 'SUBSCRIPTION',
          plan: data.plan,
        },
      });

      return { url: session.url, sessionId: session.id, plan: data.plan, amount };
    } catch (err: any) {
      throw new AppError(`Error al crear sesión de suscripción: ${err.message}`, 500);
    }
  }

  async createCryptoSubscriptionOrder(data: CreateCryptoSubscriptionDto, userId: string) {
    const planAmounts: Record<string, number> = {
      PRO: 49,
      ENTERPRISE: 249,
    };
    const amount = planAmounts[data.plan] || 49;
    const merchantTradeNo = `SUB_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    if (!process.env.BINANCE_SECRET_KEY || process.env.BINANCE_SECRET_KEY.includes('mock')) {
      await this.activateSubscriptionInDb(userId, data.plan);
    }

    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const secretKey = process.env.BINANCE_SECRET_KEY || 'mock_secret_key';

    const orderBody = {
      merchantId: process.env.BINANCE_MERCHANT_ID || 'mock_merchant',
      merchantTradeNo,
      tradeType: 'WEB',
      totalFee: amount,
      currency: data.currency || 'USDT',
      productType: 'Incubator Subscription',
      productName: `Membresía ${data.plan} Incubadora`,
      productDetail: `Acceso a plan ${data.plan}`,
    };

    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(orderBody)}\n`;
    const signature = crypto.createHmac('sha512', secretKey).update(payload).digest('hex').toUpperCase();

    const checkoutUrl = `https://pay.binance.com/checkout?tradeNo=${merchantTradeNo}&amount=${amount}&currency=${data.currency || 'USDT'}`;

    return {
      merchantTradeNo,
      checkoutUrl,
      amount,
      currency: data.currency || 'USDT',
      plan: data.plan,
      timestamp,
      nonce,
      signature,
    };
  }

  // ==========================================================================
  // 2. INVERSIONES DE CAPITAL EN STARTUPS ($50 A $10,000,000 USD)
  // ==========================================================================

  async createInvestmentCheckout(data: CreateInvestmentDto, userId: string) {
    const baseUrl = getFrontendBaseUrl(data.successUrl || data.cancelUrl);
    const successUrl = data.successUrl || `${baseUrl}/startup/${data.startupId}?payment=success`;
    const cancelUrl = data.cancelUrl || `${baseUrl}/startup/${data.startupId}?payment=cancelled`;

    const startup = await prisma.startup.findUnique({
      where: { id: data.startupId },
    });
    if (!startup) throw new AppError('La startup especificada no existe', 404);
    if (startup.userId === userId) {
      throw new AppError('No puedes invertir en tu propia startup', 400);
    }

    const amount = data.amount;
    const amountInCents = Math.round(amount * 100);

    // Sandbox / Entorno de pruebas
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
      const mockSessionId = `cs_test_${crypto.randomBytes(12).toString('hex')}`;
      
      await prisma.investment.create({
        data: {
          investorId: userId,
          startupId: data.startupId,
          amount: new Prisma.Decimal(amount),
          paymentMethodType: 'FIAT',
          currency: 'USD',
          status: 'PENDING',
          transactionHash: mockSessionId,
        },
      });

      return {
        url: `${successUrl}&session_id=${mockSessionId}&mock=true`,
        sessionId: mockSessionId,
        amount,
      };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Inversión en ${startup.name}`,
                description: `Aporte de capital de ronda para ${startup.name}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          startupId: data.startupId,
          type: 'INVESTMENT',
        },
      });

      await prisma.investment.create({
        data: {
          investorId: userId,
          startupId: data.startupId,
          amount: new Prisma.Decimal(amount),
          paymentMethodType: 'FIAT',
          currency: 'USD',
          status: 'PENDING',
          transactionHash: session.id,
        },
      });

      return { url: session.url, sessionId: session.id, amount };
    } catch (err: any) {
      throw new AppError(`Error al crear sesión de inversión: ${err.message}`, 500);
    }
  }

  async createCryptoInvestmentOrder(data: CreateCryptoInvestmentDto, userId: string) {
    const startup = await prisma.startup.findUnique({
      where: { id: data.startupId },
    });
    if (!startup) throw new AppError('La startup especificada no existe', 404);
    if (startup.userId === userId) {
      throw new AppError('No puedes invertir en tu propia startup', 400);
    }

    const merchantTradeNo = `INV_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const amount = data.amount;

    await prisma.investment.create({
      data: {
        investorId: userId,
        startupId: data.startupId,
        amount: new Prisma.Decimal(amount),
        paymentMethodType: 'CRYPTO',
        currency: data.currency || 'USDT',
        status: 'PENDING',
        transactionHash: merchantTradeNo,
      },
    });

    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const secretKey = process.env.BINANCE_SECRET_KEY || 'mock_secret_key';

    const orderBody = {
      merchantId: process.env.BINANCE_MERCHANT_ID || 'mock_merchant',
      merchantTradeNo,
      tradeType: 'WEB',
      totalFee: amount,
      currency: data.currency || 'USDT',
      productType: 'Startup Investment',
      productName: `Inversión en ${startup.name}`,
      productDetail: `Aporte de capital cripto para ${startup.name}`,
    };

    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(orderBody)}\n`;
    const signature = crypto.createHmac('sha512', secretKey).update(payload).digest('hex').toUpperCase();

    const checkoutUrl = `https://pay.binance.com/checkout?tradeNo=${merchantTradeNo}&amount=${amount}&currency=${data.currency || 'USDT'}`;

    return {
      merchantTradeNo,
      checkoutUrl,
      amount,
      currency: data.currency || 'USDT',
      timestamp,
      nonce,
      signature,
    };
  }

  // ==========================================================================
  // 3. PROCESAMIENTO GENERAL DE PAGOS Y WEBHOOKS
  // ==========================================================================

  async processSuccessfulStripePayment(sessionId: string, clientReferenceId: string, amountTotal: number, metadata?: any) {
    // 1. Manejo de Suscripciones
    if (metadata?.type === 'SUBSCRIPTION' || metadata?.plan) {
      const planName = metadata?.plan === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO';
      await this.activateSubscriptionInDb(clientReferenceId, planName, sessionId);
      return;
    }

    // 2. Manejo de Inversiones en Startups
    const startupId = metadata?.startupId;
    if (startupId) {
      const amount = amountTotal / 100;
      
      const existingInvestment = await prisma.investment.findUnique({
        where: { transactionHash: sessionId },
      });

      if (existingInvestment && existingInvestment.status === 'COMPLETED') {
        return; // Ya procesada
      }

      await prisma.$transaction([
        prisma.investment.updateMany({
          where: { transactionHash: sessionId, status: { not: 'COMPLETED' } },
          data: { status: 'COMPLETED' },
        }),
        prisma.startup.update({
          where: { id: startupId },
          data: {
            amountRaised: {
              increment: new Prisma.Decimal(amount),
            },
          },
        }),
      ]);
    }
  }

  async activateSubscriptionInDb(userId: string, plan: 'PRO' | 'ENTERPRISE', sessionId?: string) {
    const periodEnd = new Date(Date.now() + SUBSCRIPTION_PERIOD_MS);
    const planEnum = plan === 'ENTERPRISE' ? SubscriptionPlan.ENTERPRISE : SubscriptionPlan.PRO;

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: planEnum,
        status: 'ACTIVE',
        stripeSubscriptionId: sessionId || `sub_${Date.now()}`,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        plan: planEnum,
        status: 'ACTIVE',
        stripeSubscriptionId: sessionId || `sub_${Date.now()}`,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  async cancelSubscription(userId: string) {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new AppError('No tienes una suscripción activa', 404);

    return prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELED',
        plan: 'FREE',
      },
    });
  }

  async confirmInvestmentSandbox(transactionHash: string, userId?: string, userRole?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('La confirmación Sandbox está estrictamente deshabilitada en producción', 403);
    }

    const investment = await prisma.investment.findUnique({
      where: { transactionHash },
      include: { startup: true },
    });

    if (!investment) throw new AppError('Transacción no encontrada', 404);

    // Permisos: el inversor dueño de la orden o un ADMIN pueden liquidar su prueba en sandbox
    if (userRole !== 'ADMIN' && investment.investorId !== userId) {
      throw new AppError('No tienes autorización para confirmar esta transacción de prueba', 403);
    }

    // Prevención atómica de doble gasto
    const [invUpdate, startupUpdate] = await prisma.$transaction([
      prisma.investment.updateMany({
        where: { transactionHash, status: { not: 'COMPLETED' } },
        data: { status: 'COMPLETED' },
      }),
      prisma.startup.update({
        where: { id: investment.startupId },
        data: {
          amountRaised: {
            increment: investment.amount,
          },
        },
      }),
    ]);

    if (invUpdate.count === 0) {
      throw new AppError('Esta transacción ya fue acreditada previamente (Anti-Doble Gasto)', 400);
    }

    return { success: true, transactionHash, status: 'COMPLETED', startup: startupUpdate };
  }

  async getMyInvestments(userId: string) {
    return prisma.investment.findMany({
      where: { investorId: userId },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
            fundingGoal: true,
            amountRaised: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}



