'use client';

import { create } from 'zustand';
import { UserSummary, TenantSummary, AuthTokens, Role } from '@feedbackpulse/types';

interface AuthState {
  user: UserSummary | null;
  currentTenant: TenantSummary | null;
  tenants: TenantSummary[];
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  setAuth: (data: {
    user: UserSummary;
    tenant?: TenantSummary | null;
    tenants: TenantSummary[];
    tokens: AuthTokens;
  }) => void;
  setCurrentTenant: (tenant: TenantSummary) => void;
  logout: () => void;
  toggleTheme: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  currentTenant: null,
  tenants: [],
  tokens: null,
  isAuthenticated: false,
  theme: 'dark',

  setAuth: (data) => {
    const currentTenant = data.tenant || data.tenants[0] || null;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fp_auth', JSON.stringify({ ...data, currentTenant }));
    }
    set({
      user: data.user,
      currentTenant,
      tenants: data.tenants,
      tokens: data.tokens,
      isAuthenticated: true,
    });
  },

  setCurrentTenant: (tenant) => {
    set({ currentTenant: tenant });
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fp_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(
          'fp_auth',
          JSON.stringify({ ...parsed, currentTenant: tenant }),
        );
      }
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fp_auth');
    }
    set({
      user: null,
      currentTenant: null,
      tenants: [],
      tokens: null,
      isAuthenticated: false,
    });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('fp_theme', newTheme);
    }
    set({ theme: newTheme });
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') return;

    // Theme check
    const savedTheme = (localStorage.getItem('fp_theme') as 'light' | 'dark') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    set({ theme: savedTheme });

    // Auth check
    const stored = localStorage.getItem('fp_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.tokens && parsed.user) {
          set({
            user: parsed.user,
            currentTenant: parsed.currentTenant || parsed.tenants?.[0] || null,
            tenants: parsed.tenants || [],
            tokens: parsed.tokens,
            isAuthenticated: true,
          });
        }
      } catch {
        localStorage.removeItem('fp_auth');
      }
    }
  },
}));
