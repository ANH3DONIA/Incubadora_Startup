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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'ai':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60';
      case 'healthtech':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60';
      case 'cleantech':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300 dark:border-slate-800/80 dark:bg-[#0e1526]">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-lg shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              {startup.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-600 transition-colors dark:text-white line-clamp-1">
                {startup.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getIndustryBadgeStyle(startup.industry)}`}>
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
              className="flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-bold text-teal-600 dark:text-teal-400"
              title="Afinidad con tus preferencias de inversión"
            >
              <Sparkles className="h-3 w-3" />
              <span>{startup.matchScore}%</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 line-clamp-3 text-xs text-slate-600 leading-relaxed dark:text-slate-400">
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
            <span className="text-[11px] text-slate-400 font-medium italic">Nueva en incubadora</span>
          )}

          {startup.pitchDeckUrl && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              <ShieldCheck className="h-3 w-3" />
              Deck Cifrado
            </span>
          )}
        </div>
      </div>

      {/* Progress & Bottom Actions */}
      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-500">
            Fondeado: <b className="text-slate-900 dark:text-white font-bold">{formatCurrency(startup.amountRaised, 'USD', true)}</b>
          </span>
          <span className="text-slate-400">
            Meta: {formatCurrency(startup.fundingGoal, 'USD', true)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
            {percentage}% de la ronda
          </span>

          <Link
            href={`/startup/${startup.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-teal-600 hover:text-white px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-teal-600 dark:hover:text-white transition-all shadow-sm"
          >
            <span>Ver Ficha VC</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

