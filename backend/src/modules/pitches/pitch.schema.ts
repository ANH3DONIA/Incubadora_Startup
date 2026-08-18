import { z } from 'zod';

export const createPitchSessionSchema = z.object({
  body: z
    .object({
      startupId: z.string().uuid('ID de startup inválido'),
      title: z
        .string()
        .trim()
        .min(3, 'El título debe tener al menos 3 caracteres')
        .max(100, 'El título no puede exceder 100 caracteres'),
      scheduledFor: z.string().datetime('Fecha ISO requerida'),
      durationMinutes: z
        .number()
        .int('La duración debe ser un número entero')
        .refine((d) => [5, 10, 15, 30].includes(d), 'La duración debe ser de 5, 10, 15 o 30 minutos')
        .default(5),
    })
    .refine(
      (data) => {
        const scheduledTime = new Date(data.scheduledFor).getTime();
        const now = Date.now();
        const twoMinutesFromNow = now + 2 * 60 * 1000;
        const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;
        return scheduledTime >= twoMinutesFromNow && scheduledTime <= oneYearFromNow;
      },
      {
        message: 'La sesión debe programarse al menos con 2 minutos de anticipación y máximo 1 año en el futuro',
        path: ['scheduledFor'],
      }
    ),
});

export const updatePitchStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']),
  }),
});

export const updatePitchSessionSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100).optional(),
    scheduledFor: z.string().datetime('Fecha ISO requerida').optional(),
    durationMinutes: z.number().int().refine((d) => [5, 10, 15, 30].includes(d)).optional(),
  }),
});

export const ratePitchSchema = z.object({
  body: z.object({
    score: z.number().int().min(1, 'El puntaje mínimo es 1').max(5, 'El puntaje máximo es 5'),
    feedback: z.string().max(1000, 'El feedback no puede exceder 1000 caracteres').optional(),
    isPublic: z.boolean().default(false),
  }),
});

export type CreatePitchSessionDto = z.infer<typeof createPitchSessionSchema>['body'];
export type UpdatePitchStatusDto = z.infer<typeof updatePitchStatusSchema>['body'];
export type UpdatePitchSessionDto = z.infer<typeof updatePitchSessionSchema>['body'];
export type RatePitchDto = z.infer<typeof ratePitchSchema>['body'];

