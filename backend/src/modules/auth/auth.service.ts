import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/error.js';
import { RegisterDto, LoginDto } from './auth.schema.js';

export class AuthService {
  private getAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('FATAL: JWT_ACCESS_SECRET no está definida. Configura esta variable en tu archivo .env');
    }
    return secret;
  }

  private getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('FATAL: JWT_REFRESH_SECRET no está definida. Configura esta variable en tu archivo .env');
    }
    return secret;
  }

  private generateTokens(userId: string) {
    const accessSecret = this.getAccessSecret();
    const refreshSecret = this.getRefreshSecret();

    const accessToken = jwt.sign({ userId }, accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async register(data: RegisterDto) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, tokens };
  }

  async login(data: LoginDto) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const tokens = this.generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }

  async refresh(token: string) {
    try {
      const refreshSecret = this.getRefreshSecret();
      const decoded = jwt.verify(token, refreshSecret) as { userId: string };

      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token,
          userId: decoded.userId,
        },
      });

      // Token Family Reuse Detection: Si el token ya fue revocado, posible ataque de intercepción
      if (storedToken && storedToken.revokedAt !== null) {
        console.warn(`🚨 [SECURITY ALERT] Reuso detectado de refresh token revocado para userId: ${decoded.userId}. Revocando todas las sesiones activas.`);
        await prisma.refreshToken.updateMany({
          where: { userId: decoded.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new AppError('Sesión comprometida o reusada. Por favor inicia sesión nuevamente.', 401);
      }

      if (!storedToken || storedToken.expiresAt <= new Date()) {
        throw new AppError('Refresh token inválido o expirado', 401);
      }

      // Rotate refresh token (revoke current one)
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      // Generate new token pair
      const tokens = this.generateTokens(decoded.userId);

      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: decoded.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return tokens;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Refresh token expirado o inválido', 401);
    }
  }

  async logout(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return true;
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
            fundingGoal: true,
            amountRaised: true,
            description: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) throw new AppError('Usuario no encontrado', 404);
    return user;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; avatarUrl?: string | null }) {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('La contraseña actual es incorrecta', 400);
    }

    const newHashedPassword = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHashedPassword },
    });

    // Revoke old refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return true;
  }
}

