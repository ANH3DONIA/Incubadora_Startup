import { z } from 'zod';

export const createStartupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre de la startup debe tener al menos 2 caracteres')
      .max(80, 'El nombre de la startup no puede exceder 80 caracteres'),
    description: z
      .string()
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede exceder 2,000 caracteres'),
    industry: z
      .string()
      .trim()
      .min(2, 'La industria es requerida')
      .max(50, 'La industria no puede exceder 50 caracteres'),
    stage: z
      .string()
      .trim()
      .min(2, 'La etapa es requerida (ej. Pre-Seed, Seed, Series A)')
      .max(50, 'La etapa no puede exceder 50 caracteres'),
    fundingGoal: z
      .number({ invalid_type_error: 'La meta de fondeo debe ser un número válido' })
      .min(1000, 'La meta mínima de fondeo es de $1,000 USD')
      .max(50_000_000, 'La meta máxima de fondeo permitida es de $50,000,000 USD')
      .refine(
        (n) => Number.isFinite(n) && Math.floor(n * 100) === n * 100,
        'La meta de fondeo no puede tener más de 2 decimales'
      ),
  }),
});

export const updateStartupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(80, 'El nombre no puede exceder 80 caracteres')
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede exceder 2,000 caracteres')
      .optional(),
    industry: z
      .string()
      .trim()
      .min(2, 'La industria es requerida')
      .max(50, 'La industria no puede exceder 50 caracteres')
      .optional(),
    stage: z
      .string()
      .trim()
      .min(2, 'La etapa es requerida')
      .max(50, 'La etapa no puede exceder 50 caracteres')
      .optional(),
    fundingGoal: z
      .number({ invalid_type_error: 'La meta de fondeo debe ser un número' })
      .min(1000, 'La meta mínima de fondeo es de $1,000 USD')
      .max(50_000_000, 'La meta máxima de fondeo es de $50,000,000 USD')
      .refine(
        (n) => Number.isFinite(n) && Math.floor(n * 100) === n * 100,
        'La meta de fondeo no puede tener más de 2 decimales'
      )
      .optional(),
    pitchDeckUrl: z.string().url('URL inválida').max(500).optional(),
  }),
});

export const startupQuerySchema = z.object({
  query: z.object({
    search: z.string().max(100, 'El término de búsqueda no puede exceder 100 caracteres').optional(),
    industry: z.string().max(50).optional(),
    stage: z.string().max(50).optional(),
    minFunding: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Formato numérico inválido')
      .optional(),
    maxFunding: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Formato numérico inválido')
      .optional(),
    page: z
      .string()
      .regex(/^\d+$/, 'La página debe ser un entero positivo')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'El límite debe ser un entero positivo')
      .optional(),
  }),
});

export type CreateStartupDto = z.infer<typeof createStartupSchema>['body'];
export type UpdateStartupDto = z.infer<typeof updateStartupSchema>['body'];
export type StartupQueryParams = z.infer<typeof startupQuerySchema>['query'];

