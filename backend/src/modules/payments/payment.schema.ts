import { z } from 'zod';

// ============================================================================
// SCHEMAS PARA MEMBRESÍAS Y SUSCRIPCIONES (PRO & ENTERPRISE)
// ============================================================================

export const createSubscriptionSchema = z.object({
  body: z.object({
    plan: z.enum(['PRO', 'ENTERPRISE'], {
      errorMap: () => ({ message: 'El plan debe ser PRO o ENTERPRISE' }),
    }),
    successUrl: z.string().url('URL de éxito inválida').max(500).optional(),
    cancelUrl: z.string().url('URL de cancelación inválida').max(500).optional(),
  }),
});

export const createCryptoSubscriptionSchema = z.object({
  body: z.object({
    plan: z.enum(['PRO', 'ENTERPRISE'], {
      errorMap: () => ({ message: 'El plan debe ser PRO o ENTERPRISE' }),
    }),
    currency: z.enum(['USDT', 'USDC', 'BTC', 'ETH', 'USD']).default('USDT'),
  }),
});

// ============================================================================
// SCHEMAS PARA INVERSIONES DE CAPITAL EN STARTUPS
// ============================================================================

export const createInvestmentSchema = z.object({
  body: z.object({
    startupId: z.string().uuid('ID de startup inválido'),
    amount: z
      .number({ invalid_type_error: 'El monto debe ser un valor numérico' })
      .min(50, 'El monto mínimo de inversión es de $50 USD')
      .max(10_000_000, 'El monto máximo por transacción no puede superar $10,000,000 USD')
      .refine(
        (n) => Number.isFinite(n) && Number(n.toFixed(2)) === n,
        'El monto no puede tener más de 2 decimales'
      ),
    successUrl: z.string().url('URL de éxito inválida').max(500).optional(),
    cancelUrl: z.string().url('URL de cancelación inválida').max(500).optional(),
  }),
});

export const createCryptoInvestmentSchema = z.object({
  body: z.object({
    startupId: z.string().uuid('ID de startup inválido'),
    amount: z
      .number({ invalid_type_error: 'El monto debe ser un valor numérico' })
      .min(50, 'El monto mínimo de inversión cripto es de 50 USDT')
      .max(10_000_000, 'El monto máximo no puede superar 10,000,000 USDT')
      .refine(
        (n) => Number.isFinite(n) && Number(n.toFixed(2)) === n,
        'El monto no puede tener más de 2 decimales'
      ),
    currency: z.enum(['USDT', 'USDC', 'BTC', 'ETH', 'USD']).default('USDT'),
  }),
});

export const confirmSandboxSchema = z.object({
  body: z.object({
    transactionHash: z.string().min(3, 'Referencia de transacción requerida').max(150),
  }),
});

// ============================================================================
// SCHEMAS LEGACY COMPATIBILITY
// ============================================================================

export const createCheckoutSchema = z.object({
  body: z.object({
    priceId: z.string().max(100).optional().default('price_default'),
    amount: z
      .number({ invalid_type_error: 'El monto debe ser un valor numérico' })
      .min(1, 'El monto mínimo es de $1 USD')
      .max(10_000_000, 'El monto máximo por transacción no puede superar $10,000,000 USD')
      .refine(
        (n) => Number.isFinite(n) && Number(n.toFixed(2)) === n,
        'El monto no puede tener más de 2 decimales'
      )
      .optional(),
    startupId: z.string().uuid('ID de startup inválido').optional(),
    plan: z.enum(['PRO', 'ENTERPRISE']).optional(),
    successUrl: z.string().url('URL de éxito inválida').max(500).optional(),
    cancelUrl: z.string().url('URL de cancelación inválida').max(500).optional(),
    type: z.enum(['SUBSCRIPTION', 'INVESTMENT', 'TICKET']).default('INVESTMENT'),
  }),
});

export const createCryptoOrderSchema = z.object({
  body: z.object({
    amount: z
      .number({ invalid_type_error: 'El monto debe ser un valor numérico' })
      .min(1, 'El monto mínimo es de 1 USDT')
      .max(10_000_000, 'El monto máximo no puede superar 10,000,000 USDT')
      .refine(
        (n) => Number.isFinite(n) && Number(n.toFixed(2)) === n,
        'El monto no puede tener más de 2 decimales'
      ),
    currency: z.enum(['USDT', 'USDC', 'BTC', 'ETH', 'USD']).default('USDT'),
    startupId: z.string().uuid('ID de startup inválido').optional(),
    plan: z.string().max(50).optional(),
  }),
});

export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>['body'];
export type CreateCryptoSubscriptionDto = z.infer<typeof createCryptoSubscriptionSchema>['body'];
export type CreateInvestmentDto = z.infer<typeof createInvestmentSchema>['body'];
export type CreateCryptoInvestmentDto = z.infer<typeof createCryptoInvestmentSchema>['body'];
export type ConfirmSandboxDto = z.infer<typeof confirmSandboxSchema>['body'];
export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>['body'];
export type CreateCryptoOrderDto = z.infer<typeof createCryptoOrderSchema>['body'];


