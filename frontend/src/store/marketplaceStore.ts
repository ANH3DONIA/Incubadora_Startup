import { create } from 'zustand';

export interface MarketplaceFilters {
  industry: string;
  stage: string;
  minFunding?: string;
  maxFunding?: string;
  search: string;
}

interface MarketplaceState {
  filters: MarketplaceFilters;
  page: number;
  setFilter: <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

const initialFilters: MarketplaceFilters = {
  industry: 'all',
  stage: 'all',
  search: '',
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  filters: initialFilters,
  page: 1,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      page: 1,
    })),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ filters: initialFilters, page: 1 }),
}));
