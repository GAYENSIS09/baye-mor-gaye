import { create } from 'zustand';
import { api, ApiError } from '@/lib/api';
import type { Utilisateur } from '@/types/api';

interface AuthState {
  utilisateur: Utilisateur | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nom: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

function extractError(err: unknown): string {
  if (err instanceof ApiError) {
    const errorData = err.data as { error?: { message?: string } } | null;
    return errorData?.error?.message || `Erreur ${err.status}`;
  }
  if (err instanceof Error) return err.message;
  return 'Une erreur est survenue';
}

export const useAuthStore = create<AuthState>((set) => ({
  utilisateur: null,
  loading: false,
  error: null,
  hydrated: false,

  fetchUser: async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      set({ hydrated: true, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const res = await api.get<{ utilisateur: Utilisateur }>('/me');
      set({ utilisateur: res.utilisateur, loading: false, hydrated: true });
    } catch {
      localStorage.removeItem('auth-token');
      set({ loading: false, hydrated: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ utilisateur: Utilisateur; token: string }>('/login', { email, password });
      localStorage.setItem('auth-token', res.token);
      set({ utilisateur: res.utilisateur, loading: false });
    } catch (err) {
      set({ error: extractError(err), loading: false });
      throw err;
    }
  },

  register: async (nom: string, email: string, password: string, passwordConfirmation: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ utilisateur: Utilisateur; token: string }>('/register', { nom, email, password, password_confirmation: passwordConfirmation });
      localStorage.setItem('auth-token', res.token);
      set({ utilisateur: res.utilisateur, loading: false });
    } catch (err) {
      set({ error: extractError(err), loading: false });
      throw err;
    }
  },

  logout: async () => {
    try { await api.post('/logout'); } catch { /* ignore */ }
    localStorage.removeItem('auth-token');
    set({ utilisateur: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
