import { prisma } from '../../config/database.js';

export class AdminService {
  async getDashboardStats() {
    const [totalUsers, totalStartups, totalPitches, investments] = await Promise.all([
      prisma.user.count(),
      prisma.startup.count(),
      prisma.pitchSession.count(),
      prisma.investment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, currency: true, paymentMethodType: true },
      }),
    ]);

    const totalInvested = investments.reduce((acc, inv) => acc + Number(inv.amount), 0);

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

  async updateUserStatus(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
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
    const investments = await prisma.investment.findMany({
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
    });

    const fiatTotal = investments
      .filter((i) => i.paymentMethodType === 'FIAT' && i.status === 'COMPLETED')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const cryptoTotal = investments
      .filter((i) => i.paymentMethodType === 'CRYPTO' && i.status === 'COMPLETED')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      totals: {
        fiat: fiatTotal,
        crypto: cryptoTotal,
        overall: fiatTotal + cryptoTotal,
      },
      transactions: investments,
    };
  }
}
