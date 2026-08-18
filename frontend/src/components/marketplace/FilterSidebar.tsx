'use client';

import React from 'react';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { Filter, RotateCcw } from 'lucide-react';

const INDUSTRIES = [
  { label: 'Todas las industrias', value: 'all' },
  { label: 'Fintech', value: 'Fintech' },
  { label: 'AI & Machine Learning', value: 'AI' },
  { label: 'Healthtech', value: 'Healthtech' },
  { label: 'E-commerce & Retail', value: 'E-commerce' },
  { label: 'Edtech', value: 'Edtech' },
  { label: 'Web3 & Blockchain', value: 'Web3' },
  { label: 'Cleantech & Clima', value: 'Cleantech' },
];

const STAGES = [
  { label: 'Todas las etapas', value: 'all' },
  { label: 'Pre-Seed', value: 'Pre-Seed' },
  { label: 'Seed', value: 'Seed' },
  { label: 'Series A', value: 'Series A' },
  { label: 'Series B+', value: 'Series B' },
];

export const FilterSidebar: React.FC = () => {
  const { filters, setFilter, resetFilters } = useMarketplaceStore();

  return (
    <div className="w-full lg:w-64 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Filtros</span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
          title="Limpiar filtros"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* Industries */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Industria
        </label>
        <div className="space-y-1.5">
          {INDUSTRIES.map((ind) => (
            <label
              key={ind.value}
              className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <input
                type="radio"
                name="industry"
                checked={filters.industry === ind.value}
                onChange={() => setFilter('industry', ind.value)}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>{ind.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Etapa de Inversión
        </label>
        <div className="space-y-1.5">
          {STAGES.map((stg) => (
            <label
              key={stg.value}
              className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <input
                type="radio"
                name="stage"
                checked={filters.stage === stg.value}
                onChange={() => setFilter('stage', stg.value)}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>{stg.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
