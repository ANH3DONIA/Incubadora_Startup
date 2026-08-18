import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'El título del evento es obligatorio' })
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(150, 'El título no puede exceder los 150 caracteres'),
    description: z
      .string()
      .max(2000, 'La descripción no puede exceder los 2000 caracteres')
      .optional(),
    startTime: z
      .string({ required_error: 'La fecha y hora de inicio son obligatorias' })
      .datetime({ message: 'La fecha de inicio debe ser un formato ISO 8601 válido' }),
    endTime: z
      .string({ required_error: 'La fecha y hora de fin son obligatorias' })
      .datetime({ message: 'La fecha de fin debe ser un formato ISO 8601 válido' }),
  }).refine((data) => {
    const start = new Date(data.startTime).getTime();
    const end = new Date(data.endTime).getTime();
    return end > start;
  }, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endTime'],
  }),
});

export type CreateEventDto = z.infer<typeof createEventSchema>['body'];
