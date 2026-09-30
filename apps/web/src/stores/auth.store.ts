import { create } from 'zustand';
import type { User } from '@/types';
import { getToken } from '@/lib/api';
import { fetchMe, login as loginApi, logout as logoutApi } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  hydrated: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await loginApi(email, password);
      set({ user, loading: false, hydrated: true });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  logout: () => {
    logoutApi();
    set({ user: null, error: null, hydrated: true });
  },

  hydrate: async () => {
    if (get().hydrated) return;
    if (!getToken()) {
      set({ hydrated: true, loading: false, user: null });
      return;
    }
    set({ loading: true });
    try {
      const user = await fetchMe();
      set({ user, loading: false, hydrated: true });
    } catch {
      logoutApi();
      set({ user: null, loading: false, hydrated: true });
    }
  },
}));