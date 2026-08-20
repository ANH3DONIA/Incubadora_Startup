import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Email inválido')
      .max(100, 'El email no puede exceder 100 caracteres'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña no puede exceder 72 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/,
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo especial'
      ),
    firstName: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres'),
    lastName: z
      .string()
      .trim()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede exceder 50 caracteres'),
    role: z.enum(['ENTREPRENEUR', 'INVESTOR']).default('ENTREPRENEUR'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Email inválido')
      .max(100, 'El email no puede exceder 100 caracteres'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .max(72, 'La contraseña no puede exceder 72 caracteres'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10, 'El Refresh Token es requerido').max(1000),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres').optional(),
    lastName: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres').optional(),
    avatarUrl: z.string().max(2000000, 'La imagen no puede exceder 2MB').optional().or(z.literal('')).or(z.null()),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida').max(72),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña no puede exceder 72 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/,
        'La nueva contraseña debe contener mayúsculas, minúsculas, números y al menos un carácter o símbolo especial'
      ),
  }),
});

export type RegisterDto = z.infer<typeof registerSchema>['body'];
export type LoginDto = z.infer<typeof loginSchema>['body'];
export type RefreshDto = z.infer<typeof refreshSchema>['body'];
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>['body'];

