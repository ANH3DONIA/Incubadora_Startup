import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ENTREPRENEUR' | 'INVESTOR' | 'ADMIN';
  avatarUrl?: string | null;
  subscription?: {
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED';
    currentPeriodEnd?: string | Date;
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  initAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      login: (token, refreshToken, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        });
      },

      setUser: (user) => {
        if (typeof window !== 'undefined') {
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            localStorage.removeItem('user');
          }
        }
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      setTokens: (token, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
        }
        set((state) => ({
          token,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: true,
        }));
      },

      initAuth: () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            set({
              token,
              refreshToken,
              user,
              isAuthenticated: true,
              isLoading: false,
              isHydrated: true,
            });
          } catch {
            set({
              token: null,
              refreshToken: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isHydrated: true,
            });
          }
        } else {
          set({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrated: true,
          });
        }
      },

      setHydrated: (isHydrated) => {
        set({ isHydrated, isLoading: false });
      },
    }),
    {
      name: 'incubator_auth_session',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

