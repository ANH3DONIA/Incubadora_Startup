import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/error.js';

export class AdminService {
  async getDashboardStats() {
    const [totalUsers, totalStartups, totalPitches, totalInvestedAgg] = await Promise.all([
      prisma.user.count(),
      prisma.startup.count(),
      prisma.pitchSession.count(),
      prisma.investment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    const totalInvested = totalInvestedAgg._sum.amount ? Number(totalInvestedAgg._sum.amount) : 0;

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      stats: {
        totalUsers,
        totalStartups,
        totalPitches,
        totalInvested,
      },
      recentUsers,
      recentAuditLogs,
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
          startup: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserStatus(userId: string, isActive: boolean, currentAdminId?: string) {
    if (currentAdminId && userId === currentAdminId && !isActive) {
      throw new AppError('No puedes desactivar tu propia cuenta de administrador', 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new AppError('Usuario no encontrado', 404);

    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, isActive: true, role: true },
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getFinances() {
    // Exact SQL aggregation over the whole database, avoiding truncated memory slices
    const [fiatAgg, cryptoAgg, overallAgg, investments] = await Promise.all([
      prisma.investment.aggregate({
        _sum: { amount: true },
        where: { paymentMethodType: 'FIAT', status: 'COMPLETED' },
      }),
      prisma.investment.aggregate({
        _sum: { amount: true },
        where: { paymentMethodType: 'CRYPTO', status: 'COMPLETED' },
      }),
      prisma.investment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.investment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          investor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          startup: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    const fiatTotal = fiatAgg._sum.amount ? Number(fiatAgg._sum.amount) : 0;
    const cryptoTotal = cryptoAgg._sum.amount ? Number(cryptoAgg._sum.amount) : 0;
    const overallTotal = overallAgg._sum.amount ? Number(overallAgg._sum.amount) : 0;

    return {
      totals: {
        fiat: fiatTotal,
        crypto: cryptoTotal,
        overall: overallTotal,
      },
      transactions: investments,
    };
  }
}
