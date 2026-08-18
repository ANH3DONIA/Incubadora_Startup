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
    <div className="w-full lg:w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Filter className="h-4 w-4 text-teal-600" />
          <span>Filtros</span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 dark:text-slate-400"
          title="Limpiar filtros"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Industries */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Industria
        </label>
        <div className="space-y-1.5">
          {INDUSTRIES.map((ind) => (
            <label
              key={ind.value}
              className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-teal-600"
            >
              <input
                type="radio"
                name="industry"
                checked={filters.industry === ind.value}
                onChange={() => setFilter('industry', ind.value)}
                className="h-3.5 w-3.5 text-teal-600 focus:ring-teal-500 rounded border-slate-300"
              />
              <span>{ind.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Etapa de Inversión
        </label>
        <div className="space-y-1.5">
          {STAGES.map((stg) => (
            <label
              key={stg.value}
              className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-teal-600"
            >
              <input
                type="radio"
                name="stage"
                checked={filters.stage === stg.value}
                onChange={() => setFilter('stage', stg.value)}
                className="h-3.5 w-3.5 text-teal-600 focus:ring-teal-500 rounded border-slate-300"
              />
              <span>{stg.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
