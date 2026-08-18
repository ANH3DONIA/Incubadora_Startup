import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';

export class MatchmakingService {
  async getPreferences(userId: string) {
    let pref = await prisma.matchmakingPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await prisma.matchmakingPreference.create({
        data: {
          userId,
          preferredIndustries: [],
          preferredStages: [],
        },
      });
    }

    return {
      ...pref,
      minTicketSize: pref.minTicketSize ? Number(pref.minTicketSize) : null,
      maxTicketSize: pref.maxTicketSize ? Number(pref.maxTicketSize) : null,
    };
  }

  async updatePreferences(userId: string, data: {
    preferredIndustries?: string[];
    preferredStages?: string[];
    minTicketSize?: number;
    maxTicketSize?: number;
  }) {
    return prisma.matchmakingPreference.upsert({
      where: { userId },
      update: {
        preferredIndustries: data.preferredIndustries,
        preferredStages: data.preferredStages,
        minTicketSize: data.minTicketSize ? new Prisma.Decimal(data.minTicketSize) : null,
        maxTicketSize: data.maxTicketSize ? new Prisma.Decimal(data.maxTicketSize) : null,
      },
      create: {
        userId,
        preferredIndustries: data.preferredIndustries || [],
        preferredStages: data.preferredStages || [],
        minTicketSize: data.minTicketSize ? new Prisma.Decimal(data.minTicketSize) : null,
        maxTicketSize: data.maxTicketSize ? new Prisma.Decimal(data.maxTicketSize) : null,
      },
    });
  }

  async getMatches(userId: string) {
    const preferences = await prisma.matchmakingPreference.findUnique({
      where: { userId },
    });

    const allStartups = await prisma.startup.findMany({
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
          select: { score: true },
        },
      },
    });

    if (!preferences || (preferences.preferredIndustries.length === 0 && preferences.preferredStages.length === 0)) {
      // Default: Return all startups with a default baseline score
      return allStartups.map((s) => ({
        ...s,
        fundingGoal: Number(s.fundingGoal),
        amountRaised: Number(s.amountRaised),
        matchScore: 75,
      }));
    }

    // Calculate match score
    const scored = allStartups.map((s) => {
      let score = 50; // base score

      const industryMatch = preferences.preferredIndustries.some(
        (ind) => ind.toLowerCase() === s.industry.toLowerCase()
      );
      if (industryMatch) score += 30;

      const stageMatch = preferences.preferredStages.some(
        (stg) => stg.toLowerCase() === s.stage.toLowerCase()
      );
      if (stageMatch) score += 20;

      return {
        ...s,
        fundingGoal: Number(s.fundingGoal),
        amountRaised: Number(s.amountRaised),
        matchScore: Math.min(score, 100),
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }
}
