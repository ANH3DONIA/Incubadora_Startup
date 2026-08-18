'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { StartupCard, StartupItem } from '@/components/marketplace/StartupCard';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilter, page, setPage } = useMarketplaceStore();
  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [pagination, setPagination] = useState<{ totalPages: number; total: number }>({
    totalPages: 1,
    total: 0,
  });

  // Sync initial URL searchParams to store on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlIndustry = searchParams.get('industry');
    const urlStage = searchParams.get('stage');
    const urlPage = searchParams.get('page');

    if (urlSearch !== null && urlSearch !== filters.search) {
      setFilter('search', urlSearch);
      setSearchInput(urlSearch);
    }
    if (urlIndustry !== null && urlIndustry !== filters.industry) {
      setFilter('industry', urlIndustry);
    }
    if (urlStage !== null && urlStage !== filters.stage) {
      setFilter('stage', urlStage);
    }
    if (urlPage !== null) {
      const p = parseInt(urlPage, 10);
      if (!isNaN(p) && p > 0) setPage(p);
    }
  }, []);

  // Debounce search input by 300ms to eliminate network spam
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilter('search', searchInput);
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, setFilter, setPage]);

  // Fetch startups and update URL
  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.industry && filters.industry !== 'all') queryParams.append('industry', filters.industry);
        if (filters.stage && filters.stage !== 'all') queryParams.append('stage', filters.stage);
        queryParams.append('page', page.toString());
        queryParams.append('limit', '9');

        // Update URL query string silently without full reload
        const newRelativePathQuery = window.location.pathname + '?' + queryParams.toString();
        window.history.replaceState(null, '', newRelativePathQuery);

        const { data } = await api.get(`/startups?${queryParams.toString()}`);
        setStartups(data.data || []);
        if (data.pagination) {
          setPagination({
            totalPages: data.pagination.totalPages,
            total: data.pagination.total,
          });
        }
      } catch (err) {
        console.error('Error loading startups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [filters, page]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
              <Sparkles className="h-3.5 w-3.5" />
              Directorio de Oportunidades
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
            Marketplace de Startups
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explora startups auditadas con Pitch Decks cifrados y rondas abiertas para inversión
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm self-start sm:self-auto">
          Total disponibles: <span className="text-teal-600 dark:text-teal-400">{pagination.total} Startups</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nombre, solución, modelo de negocio o tecnología..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-xs text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-[#0e1526] dark:text-white transition"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Main Grid with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar />

        <div className="flex-1 w-full space-y-6">
          {loading ? (
            /* Skeleton Cards Loading State */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 pt-4" />
                </div>
              ))}
            </div>
          ) : startups.length === 0 ? (
            <EmptyState
              title="No se encontraron startups"
              description="No hay startups que coincidan con los filtros actuales. Prueba cambiando de industria o borrando la búsqueda."
              icon={ShoppingBag}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {startups.map((startup) => (
                  <StartupCard key={startup.id} startup={startup} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                          page === pageNum
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

