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

    // Exclude startups owned by the requesting user themselves
    const allStartups = await prisma.startup.findMany({
      where: {
        userId: { not: userId },
      },
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

    const minTicket = preferences?.minTicketSize ? Number(preferences.minTicketSize) : null;
    const maxTicket = preferences?.maxTicketSize ? Number(preferences.maxTicketSize) : null;

    if (!preferences || (preferences.preferredIndustries.length === 0 && preferences.preferredStages.length === 0 && !minTicket && !maxTicket)) {
      // Default: Return all startups with a default baseline score and calculated averageRating
      return allStartups.map((s) => {
        const avgRating =
          s.ratings && s.ratings.length > 0
            ? s.ratings.reduce((acc, curr) => acc + curr.score, 0) / s.ratings.length
            : null;

        return {
          ...s,
          fundingGoal: Number(s.fundingGoal),
          amountRaised: Number(s.amountRaised),
          averageRating: avgRating ? Number(avgRating.toFixed(1)) : null,
          matchScore: 75,
        };
      });
    }

    // Calculate match score
    const scored = allStartups.map((s) => {
      let score = 40; // baseline score
      const fundingGoal = Number(s.fundingGoal);

      // Industry match (up to 30 pts)
      if (preferences.preferredIndustries.length > 0) {
        const industryMatch = preferences.preferredIndustries.some(
          (ind) => ind.toLowerCase() === s.industry.toLowerCase()
        );
        if (industryMatch) score += 30;
      } else {
        score += 15;
      }

      // Stage match (up to 20 pts)
      if (preferences.preferredStages.length > 0) {
        const stageMatch = preferences.preferredStages.some(
          (stg) => stg.toLowerCase() === s.stage.toLowerCase()
        );
        if (stageMatch) score += 20;
      } else {
        score += 10;
      }

      // Investment ticket fit (up to 20 pts)
      if (minTicket !== null || maxTicket !== null) {
        const fitsMin = minTicket === null || fundingGoal >= minTicket;
        const fitsMax = maxTicket === null || fundingGoal <= maxTicket;
        if (fitsMin && fitsMax) {
          score += 20;
        }
      }

      const avgRating =
        s.ratings && s.ratings.length > 0
          ? s.ratings.reduce((acc, curr) => acc + curr.score, 0) / s.ratings.length
          : null;

      return {
        ...s,
        fundingGoal,
        amountRaised: Number(s.amountRaised),
        averageRating: avgRating ? Number(avgRating.toFixed(1)) : null,
        matchScore: Math.min(score, 100),
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }
}
