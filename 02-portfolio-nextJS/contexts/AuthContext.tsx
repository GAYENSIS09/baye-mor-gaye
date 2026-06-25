'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';

interface Proprietaire {
  id: number;
  utilisateur_id: number;
  bio: string | null;
  titre_professionnel: string | null;
  localisation: string | null;
  site_web: string | null;
  url_linkedin: string | null;
  url_github: string | null;
  created_at: string;
  updated_at: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  photo: string | null;
  email_verifie_le: string | null;
  derniere_connexion_le: string | null;
  proprietaire: Proprietaire | null;
}

interface AuthContextType {
  utilisateur: Utilisateur | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Utilisateur>;
  register: (nom: string, email: string, password: string, passwordConfirmation: string) => Promise<Utilisateur>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      api.get<Utilisateur>('/me')
        .then((res) => {
          setUtilisateur(res);
        })
        .catch((err) => {
          if (err instanceof ApiError && err.status === 401) {
            clearToken();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const setToken = (token: string) => {
    localStorage.setItem('auth-token', token);
    document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
  };

  const clearToken = () => {
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=; path=/; max-age=0';
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ utilisateur: Utilisateur; token: string }>('/login', { email, password });
    setToken(res.token);
    setUtilisateur(res.utilisateur);
    return res.utilisateur;
  }, []);

  const register = useCallback(async (nom: string, email: string, password: string, passwordConfirmation: string) => {
    const res = await api.post<{ utilisateur: Utilisateur; token: string }>('/register', {
      nom,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    setToken(res.token);
    setUtilisateur(res.utilisateur);
    return res.utilisateur;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<Utilisateur>('/me');
      setUtilisateur(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch {
      // ignore
    }
    clearToken();
    setUtilisateur(null);
  }, []);

  return (
    <AuthContext.Provider value={{ utilisateur, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
