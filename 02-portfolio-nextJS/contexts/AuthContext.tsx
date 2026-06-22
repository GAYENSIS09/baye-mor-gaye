'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { auditLog, useAuditMount, useAuditRender, useAuditHook } from '@/lib/react-audit';

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
  login: (email: string, password: string) => Promise<void>;
  register: (nom: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  useAuditMount('AuthProvider');
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  useAuditHook('AuthProvider', 'useState', { name: 'utilisateur' });
  useAuditHook('AuthProvider', 'useState', { name: 'loading' });

  useEffect(() => {
    useAuditHook('AuthProvider', 'useEffect', { phase: 'init' });
    const token = localStorage.getItem('auth-token');
    if (token) {
      auditLog.query('AuthProvider', '/me', undefined, undefined, undefined, undefined);
      api.get<Utilisateur>('/me')
        .then((res) => {
          auditLog.query('AuthProvider', '/me', undefined, res, undefined, undefined);
          setUtilisateur(res);
        })
        .catch((err) => {
          auditLog.query('AuthProvider', '/me', undefined, undefined, err, undefined);
          if (err instanceof ApiError && err.status === 401) {
            clearToken();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      useAuditHook('AuthProvider', 'useEffect', { phase: 'cleanup' });
    };
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
    useAuditHook('AuthProvider', 'useCallback', { name: 'login' });
    const res = await api.post<{ utilisateur: Utilisateur; token: string }>('/login', { email, password });
    auditLog.mutation('AuthProvider', '/login', { email }, res, undefined, undefined);
    setToken(res.token);
    setUtilisateur(res.utilisateur);
  }, []);

  const register = useCallback(async (nom: string, email: string, password: string, passwordConfirmation: string) => {
    useAuditHook('AuthProvider', 'useCallback', { name: 'register' });
    const res = await api.post<{ utilisateur: Utilisateur; token: string }>('/register', {
      nom,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    auditLog.mutation('AuthProvider', '/register', { nom, email }, res, undefined, undefined);
    setToken(res.token);
    setUtilisateur(res.utilisateur);
  }, []);

  const logout = useCallback(async () => {
    useAuditHook('AuthProvider', 'useCallback', { name: 'logout' });
    try {
      await api.post('/logout');
    } catch {
      // ignore
    }
    clearToken();
    setUtilisateur(null);
  }, []);

  useAuditRender('AuthProvider', { children: '...' }, { utilisateur: utilisateur?.id ?? null, loading });

  return (
    <AuthContext.Provider value={{ utilisateur, loading, login, register, logout }}>
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
