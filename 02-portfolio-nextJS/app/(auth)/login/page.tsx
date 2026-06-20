'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(searchParams.get('redirect') || '/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded border border-[#222] w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-off-white">Connexion</h1>
        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-off-white">Email</label>
          <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            spellCheck={false}
            className="mt-1 w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-off-white">Mot de passe</label>
          <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
            className="mt-1 w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-acid text-black py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className="text-sm text-center text-muted">
          Pas encore de compte ? <Link href="/register" className="text-acid hover:underline">S&apos;inscrire</Link>
        </p>
      </form>
    </div>
  );
}
