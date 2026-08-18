import { z } from 'zod';

export const createCheckoutSchema = z.object({
  body: z.object({
    priceId: z.string().max(100).optional().default('price_default'),
    amount: z
      .number({ invalid_type_error: 'El monto debe ser un valor numérico' })
      .min(50, 'El monto mínimo de inversión o pago es de $50 USD')
      .max(10_000_000, 'El monto máximo por transacción no puede superar $10,000,000 USD')
      .refine(
        (n) => Number.isFinite(n) && Math.floor(n * 100) === n * 100,
        'El monto no puede tener más de 2 decimales'
      )
      .optional(),
    startupId: z.string().uuid('ID de startup inválido').optional(),
    successUrl: z.string().url('URL de éxito inválida').max(500).optional(),
    cancelUrl: z.string().url('URL de cancelación inválida').max(500).optional(),
    type: z.enum(['SUBSCRIPTION', 'INVESTMENT', 'TICKET']).default('INVESTMENT'),
  }),
});

export const createCryptoOrderSchema = z.object({
  body: z.object({
    amount: z
      .number({ invalid_type_error: 'El monto debe ser un valor numérico' })
      .min(50, 'El monto mínimo de inversión cripto es de 50 USDT')
      .max(10_000_000, 'El monto máximo no puede superar 10,000,000 USDT')
      .refine(
        (n) => Number.isFinite(n) && Math.floor(n * 100) === n * 100,
        'El monto no puede tener más de 2 decimales'
      ),
    currency: z.enum(['USDT', 'USDC', 'BTC', 'ETH', 'USD']).default('USDT'),
    startupId: z.string().uuid('ID de startup inválido').optional(),
    plan: z.string().max(50).optional(),
  }),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>['body'];
export type CreateCryptoOrderDto = z.infer<typeof createCryptoOrderSchema>['body'];

