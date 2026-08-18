import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/error.js';
import { CreatePitchSessionDto, RatePitchDto } from './pitch.schema.js';
import { PitchSessionStatus } from '@prisma/client';

export class PitchService {
  async createSession(data: CreatePitchSessionDto, userId: string, userRole: string) {
    const startup = await prisma.startup.findUnique({
      where: { id: data.startupId },
    });

    if (!startup) throw new AppError('Startup no encontrada', 404);
    if (startup.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('No tienes permiso para crear pitches para esta startup', 403);
    }

    const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars code

    return prisma.pitchSession.create({
      data: {
        startupId: data.startupId,
        title: data.title,
        scheduledFor: new Date(data.scheduledFor),
        durationMinutes: data.durationMinutes,
        room: {
          create: {
            accessCode,
          },
        },
      },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        room: true,
      },
    });
  }

  async getUpcomingSessions() {
    return prisma.pitchSession.findMany({
      where: {
        status: { in: ['SCHEDULED', 'LIVE'] },
      },
      orderBy: { scheduledFor: 'asc' },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        room: {
          select: {
            id: true,
            accessCode: true,
            isLocked: true,
          },
        },
      },
    });
  }

  async getSessionById(id: string) {
    const session = await prisma.pitchSession.findUnique({
      where: { id },
      include: {
        startup: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        room: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) throw new AppError('Sesión de pitch no encontrada', 404);
    return session;
  }

  async getRoomByCodeOrId(identifier: string) {
    const room = await prisma.room.findFirst({
      where: {
        OR: [{ id: identifier }, { accessCode: identifier }],
      },
      include: {
        pitchSession: {
          include: {
            startup: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!room) throw new AppError('Sala de pitch no encontrada', 404);
    return room;
  }

  async updateStatus(id: string, status: PitchSessionStatus, userId: string, userRole: string) {
    const session = await prisma.pitchSession.findUnique({
      where: { id },
      include: { startup: true },
    });

    if (!session) throw new AppError('Sesión de pitch no encontrada', 404);

    if (session.startup.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('No tienes permisos para cambiar el estado de este pitch', 403);
    }

    return prisma.pitchSession.update({
      where: { id },
      data: { status },
    });
  }

  async rateStartup(startupId: string, investorId: string, data: RatePitchDto) {
    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) throw new AppError('Startup no encontrada', 404);

    if (startup.userId === investorId) {
      throw new AppError('No puedes calificar tu propia startup', 400);
    }

    return prisma.rating.upsert({
      where: {
        startupId_investorId: {
          startupId,
          investorId,
        },
      },
      update: {
        score: data.score,
        feedback: data.feedback,
        isPublic: data.isPublic,
      },
      create: {
        startupId,
        investorId,
        score: data.score,
        feedback: data.feedback,
        isPublic: data.isPublic,
      },
    });
  }

  async getMyStartupPitches(userId: string) {
    const startup = await prisma.startup.findUnique({ where: { userId } });
    if (!startup) return [];

    return prisma.pitchSession.findMany({
      where: { startupId: startup.id },
      include: {
        room: true,
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
      orderBy: { scheduledFor: 'desc' },
    });
  }

  async updateSession(
    id: string,
    data: { title?: string; scheduledFor?: string; durationMinutes?: number },
    userId: string,
    userRole: string
  ) {
    const session = await prisma.pitchSession.findUnique({
      where: { id },
      include: { startup: true },
    });

    if (!session) throw new AppError('Sesión de pitch no encontrada', 404);

    if (session.startup.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('No tienes permisos para modificar este pitch', 403);
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title.trim().slice(0, 100);
    if (data.scheduledFor) updateData.scheduledFor = new Date(data.scheduledFor);
    if (data.durationMinutes) updateData.durationMinutes = data.durationMinutes;

    return prisma.pitchSession.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteSession(id: string, userId: string, userRole: string) {
    const session = await prisma.pitchSession.findUnique({
      where: { id },
      include: { startup: true },
    });

    if (!session) throw new AppError('Sesión de pitch no encontrada', 404);

    if (session.startup.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('No tienes permisos para eliminar este pitch', 403);
    }

    // Delete room participants first if any, then room, then pitch session
    await prisma.pitchSession.delete({
      where: { id },
    });

    return true;
  }
}

