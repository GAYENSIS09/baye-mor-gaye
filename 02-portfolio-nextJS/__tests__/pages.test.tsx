import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { AuthContext } from '@/contexts/AuthContext';

const mockAuthValue = {
  utilisateur: null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={mockAuthValue}>{children}</AuthContext.Provider>;
}

describe('LoginPage', () => {
  it('affiche le formulaire de connexion', async () => {
    const LoginPage = (await import('../app/(auth)/login/page')).default;
    render(<AuthWrapper><LoginPage /></AuthWrapper>);

    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  it('affiche le formulaire d\'inscription', async () => {
    const RegisterPage = (await import('../app/(auth)/register/page')).default;
    render(<AuthWrapper><RegisterPage /></AuthWrapper>);

    expect(screen.getByText('Inscription')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });
});

describe('ContactPage', () => {
  it('affiche le formulaire de contact', async () => {
    const queryClient = new QueryClient();
    const ContactPage = (await import('../app/contact/page')).default;
    render(<QueryClientProvider client={queryClient}><ContactPage /></QueryClientProvider>);

    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByText('Envoyer')).toBeInTheDocument();
  });
});
