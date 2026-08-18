'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { Building2, Sparkles, TrendingUp, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { RatingStars } from '../ui/RatingStars';

export interface StartupItem {
  id: string;
  name: string;
  industry: string;
  stage: string;
  fundingGoal: number;
  amountRaised: number;
  description: string;
  pitchDeckUrl?: string | null;
  encryptedPitchDeck?: string | null;
  averageRating?: number | null;
  matchScore?: number;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

interface StartupCardProps {
  startup: StartupItem;
}

export const StartupCard: React.FC<StartupCardProps> = ({ startup }) => {
  const percentage = calculatePercentage(startup.amountRaised, startup.fundingGoal);

  // Industry badge color map
  const getIndustryBadgeStyle = (ind: string) => {
    switch (ind.toLowerCase()) {
      case 'fintech':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60';
      case 'ai':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60';
      case 'healthtech':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60';
      case 'cleantech':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 hover:border-blue-500/40 transition-all duration-200 dark:border-slate-800/80 dark:bg-[#0b0f19] dark:hover:border-blue-500/30">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base group-hover:scale-105 transition-transform">
              {startup.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white line-clamp-1">
                {startup.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getIndustryBadgeStyle(startup.industry)}`}>
                  {startup.industry}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {startup.stage}
                </span>
              </div>
            </div>
          </div>

          {startup.matchScore !== undefined && (
            <div
              className="flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400"
              title="Afinidad con tus preferencias de inversión"
            >
              <Sparkles className="h-3 w-3" />
              <span>{startup.matchScore}%</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-3.5 line-clamp-3 text-xs text-slate-600 leading-relaxed dark:text-slate-400">
          {startup.description}
        </p>

        {/* Rating and Security Tag */}
        <div className="mt-4 flex items-center justify-between">
          {startup.averageRating ? (
            <div className="flex items-center gap-1.5">
              <RatingStars rating={startup.averageRating} size={13} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {startup.averageRating.toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium italic">En evaluación</span>
          )}

          {startup.pitchDeckUrl && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-500/20">
              <ShieldCheck className="h-3 w-3" />
              Deck Cifrado
            </span>
          )}
        </div>
      </div>

      {/* Progress & Bottom Actions */}
      <div className="mt-5 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-500">
            Fondeado: <b className="text-slate-900 dark:text-white font-bold">{formatCurrency(startup.amountRaised, 'USD', true)}</b>
          </span>
          <span className="text-slate-400">
            Meta: {formatCurrency(startup.fundingGoal, 'USD', true)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {percentage}% financiado
          </span>

          <Link
            href={`/startup/${startup.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-blue-600 dark:hover:text-white transition-all"
          >
            <span>Ver Ficha VC</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

