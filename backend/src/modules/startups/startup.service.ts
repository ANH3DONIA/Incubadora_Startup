import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/error.js';
import { encryptBuffer, decryptBuffer } from '../../utils/crypto.js';
import { CreateStartupDto, UpdateStartupDto, StartupQueryParams } from './startup.schema.js';
import { Prisma } from '@prisma/client';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'pitch-decks');

export class StartupService {
  constructor() {
    // Ensure uploads directory exists
    fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);
  }

  async create(data: CreateStartupDto, userId: string) {
    const existing = await prisma.startup.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new AppError('El usuario ya tiene una startup registrada', 400);
    }

    return prisma.startup.create({
      data: {
        name: data.name,
        description: data.description,
        industry: data.industry,
        stage: data.stage,
        fundingGoal: new Prisma.Decimal(data.fundingGoal),
        userId,
      },
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
    });
  }

  async findAll(params: StartupQueryParams) {
    const parsedPage = parseInt(params.page || '1', 10);
    const parsedLimit = parseInt(params.limit || '12', 10);
    const page = Number.isFinite(parsedPage) ? Math.max(1, Math.min(parsedPage, 1000)) : 1;
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 50)) : 12;
    const skip = (page - 1) * limit;

    const where: Prisma.StartupWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.industry && params.industry !== 'all') {
      where.industry = { equals: params.industry, mode: 'insensitive' };
    }

    if (params.stage && params.stage !== 'all') {
      where.stage = { equals: params.stage, mode: 'insensitive' };
    }

    if (params.minFunding || params.maxFunding) {
      where.fundingGoal = {};
      if (params.minFunding) where.fundingGoal.gte = new Prisma.Decimal(params.minFunding);
      if (params.maxFunding) where.fundingGoal.lte = new Prisma.Decimal(params.maxFunding);
    }

    const [total, startups] = await Promise.all([
      prisma.startup.count({ where }),
      prisma.startup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          ratings: {
            select: {
              score: true,
            },
          },
          _count: {
            select: {
              investments: true,
              pitchSessions: true,
            },
          },
        },
      }),
    ]);

    const formattedStartups = startups.map((s) => {
      const avgRating =
        s.ratings.length > 0
          ? s.ratings.reduce((acc, curr) => acc + curr.score, 0) / s.ratings.length
          : null;

      return {
        ...s,
        fundingGoal: Number(s.fundingGoal),
        amountRaised: Number(s.amountRaised),
        averageRating: avgRating ? Number(avgRating.toFixed(1)) : null,
      };
    });

    return {
      startups: formattedStartups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const startup = await prisma.startup.findUnique({
      where: { id },
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
        pitchSessions: {
          where: { status: { in: ['SCHEDULED', 'LIVE'] } },
          orderBy: { scheduledFor: 'asc' },
        },
        ratings: {
          include: {
            investor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!startup) {
      throw new AppError('Startup no encontrada', 404);
    }

    return {
      ...startup,
      fundingGoal: Number(startup.fundingGoal),
      amountRaised: Number(startup.amountRaised),
    };
  }

  async getMyStartup(userId: string) {
    const startup = await prisma.startup.findUnique({
      where: { userId },
      include: {
        pitchSessions: {
          orderBy: { scheduledFor: 'desc' },
        },
        investments: {
          include: {
            investor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        ratings: true,
      },
    });

    if (!startup) {
      return null;
    }

    return {
      ...startup,
      fundingGoal: Number(startup.fundingGoal),
      amountRaised: Number(startup.amountRaised),
    };
  }

  async update(id: string, data: UpdateStartupDto, userId: string, userRole: string) {
    const startup = await prisma.startup.findUnique({ where: { id } });
    if (!startup) throw new AppError('Startup no encontrada', 404);

    if (startup.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('No tienes permiso para actualizar esta startup', 403);
    }

    const updateData: Prisma.StartupUpdateInput = {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.industry ? { industry: data.industry } : {}),
      ...(data.stage ? { stage: data.stage } : {}),
      ...(data.fundingGoal ? { fundingGoal: new Prisma.Decimal(data.fundingGoal) } : {}),
      ...(data.pitchDeckUrl ? { pitchDeckUrl: data.pitchDeckUrl } : {}),
    };

    return prisma.startup.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const startup = await prisma.startup.findUnique({
      where: { id },
      include: {
        _count: {
          select: { investments: true },
        },
      },
    });
    if (!startup) throw new AppError('Startup no encontrada', 404);

    if (startup.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('No tienes permiso para eliminar esta startup', 403);
    }

    // Proteccion contable: no permitir borrado de startups con fondos recaudados o inversiones activas
    if (Number(startup.amountRaised) > 0 || startup._count.investments > 0) {
      throw new AppError(
        'No es posible eliminar una startup con transacciones financieras o fondos recaudados registrados. Contacta a soporte para liquidación o deslistado.',
        400
      );
    }

    // Clean up encrypted file on disk
    if (startup.encryptedPitchDeck) {
      try {
        await fs.unlink(startup.encryptedPitchDeck);
      } catch {
        // File may already be removed, ignore
      }
    }

    await prisma.startup.delete({ where: { id } });
    return true;
  }

  async uploadPitchDeck(startupId: string, userId: string, fileBuffer: Buffer, originalFilename: string) {
    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) throw new AppError('Startup no encontrada', 404);
    if (startup.userId !== userId) throw new AppError('No autorizado para modificar esta startup', 403);

    // Strict validation of Magic Bytes (%PDF - 0x25 0x50 0x44 0x46)
    if (fileBuffer.length < 4 || fileBuffer.subarray(0, 4).toString('utf-8') !== '%PDF') {
      throw new AppError('Archivo inválido. El contenido binario no corresponde a un documento PDF legítimo (%PDF)', 400);
    }

    // Remove old encrypted file if it exists
    if (startup.encryptedPitchDeck) {
      try {
        await fs.unlink(startup.encryptedPitchDeck);
      } catch {
        // File may not exist on disk, ignore
      }
    }

    // Encrypt file with AES-256-GCM
    const encrypted = encryptBuffer(fileBuffer);
    const fileName = `${startupId}_${Date.now()}_encrypted.enc`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, encrypted);

    return prisma.startup.update({
      where: { id: startupId },
      data: {
        encryptedPitchDeck: filePath,
        pitchDeckUrl: `/api/startups/${startupId}/pitch-deck/file`,
      },
    });
  }

  async getDecryptedPitchDeck(startupId: string, userId: string, userRole: string) {
    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup || !startup.encryptedPitchDeck) {
      throw new AppError('Pitch deck no disponible', 404);
    }

    // Permission check: owner, admin, or investor
    if (startup.userId !== userId && userRole !== 'ADMIN' && userRole !== 'INVESTOR') {
      throw new AppError('Acceso denegado al pitch deck', 403);
    }

    const encryptedData = await fs.readFile(startup.encryptedPitchDeck);
    return decryptBuffer(encryptedData);
  }
}
