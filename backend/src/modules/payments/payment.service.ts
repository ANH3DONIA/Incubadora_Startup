import crypto from 'crypto';
import Stripe from 'stripe';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/error.js';
import { CreateCheckoutDto, CreateCryptoOrderDto } from './payment.schema.js';
import { Prisma } from '@prisma/client';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia' as any,
});

export class PaymentService {
  async createStripeCheckout(data: CreateCheckoutDto, userId: string) {
    const successUrl = data.successUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/dashboard?payment=success`;
    const cancelUrl = data.cancelUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/pricing?payment=cancelled`;

    const amount = data.amount || 100;
    const amountInCents = Math.round(amount * 100);

    if (data.startupId) {
      const startup = await prisma.startup.findUnique({
        where: { id: data.startupId },
      });
      if (!startup) throw new AppError('La startup especificada no existe', 404);
      if (startup.userId === userId) {
        throw new AppError('No puedes invertir en tu propia startup', 400);
      }
    }

    // If Stripe secret key is mock or test, return sandbox checkout url
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
      const mockSessionId = `cs_test_${crypto.randomBytes(12).toString('hex')}`;
      
      // Auto-record pending investment if startupId provided
      if (data.startupId) {
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
      }

      return {
        url: `${successUrl}&session_id=${mockSessionId}&mock=true`,
        sessionId: mockSessionId,
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
                name: data.startupId ? 'Inversión en Startup' : 'Suscripción Incubadora Pro',
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
          startupId: data.startupId || '',
          type: data.type,
        },
      });

      if (data.startupId) {
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
      }

      return { url: session.url, sessionId: session.id };
    } catch (err: any) {
      throw new AppError(`Error al crear sesión de pago: ${err.message}`, 500);
    }
  }

  async processSuccessfulStripePayment(sessionId: string, clientReferenceId: string, amountTotal: number, metadata?: any) {
    const startupId = metadata?.startupId;

    if (startupId) {
      const amount = amountTotal / 100;
      
      // Check existing investment status to prevent duplicate crediting
      const existingInvestment = await prisma.investment.findUnique({
        where: { transactionHash: sessionId },
      });

      if (existingInvestment && existingInvestment.status === 'COMPLETED') {
        return; // Already processed
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

  async createBinanceOrder(data: CreateCryptoOrderDto, userId: string) {
    const merchantTradeNo = `ORDER_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const amount = data.amount;

    if (data.startupId) {
      const startup = await prisma.startup.findUnique({
        where: { id: data.startupId },
      });
      if (!startup) throw new AppError('La startup especificada no existe', 404);
      if (startup.userId === userId) {
        throw new AppError('No puedes invertir en tu propia startup', 400);
      }

      // Record pending investment in DB
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
    }

    // Generate Binance Pay Payload & Signature
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const secretKey = process.env.BINANCE_SECRET_KEY || 'mock_secret_key';

    const orderBody = {
      merchantId: process.env.BINANCE_MERCHANT_ID || 'mock_merchant',
      merchantTradeNo,
      tradeType: 'WEB',
      totalFee: amount,
      currency: data.currency || 'USDT',
      productType: 'Incubator Investment',
      productName: 'Startup Quick Pitch Investment',
      productDetail: `Inversión para startup ${data.startupId || 'Incubadora'}`,
    };

    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(orderBody)}\n`;
    const signature = crypto.createHmac('sha512', secretKey).update(payload).digest('hex').toUpperCase();

    // Simulation / Sandbox URL
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

  async confirmInvestmentSandbox(transactionHash: string, userId?: string, userRole?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('La confirmación Sandbox está estrictamente deshabilitada en producción', 403);
    }

    const investment = await prisma.investment.findUnique({
      where: { transactionHash },
      include: { startup: true },
    });

    if (!investment) throw new AppError('Transacción no encontrada', 404);

    // Permission check: solo ADMIN puede confirmar manualmente en sandbox
    if (userRole !== 'ADMIN') {
      throw new AppError('Solo un administrador puede forzar la confirmación de pruebas sandbox', 403);
    }

    // Prevención atómica de doble acreditación con condición de estado en UPDATE
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
      throw new AppError('Esta transacción ya fue acreditada previamente (Anti-Doble Gasto / Race Condition)', 400);
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

