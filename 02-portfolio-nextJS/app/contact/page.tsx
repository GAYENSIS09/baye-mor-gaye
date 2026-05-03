'use client';

import { useState } from 'react';
import { useContactForm } from '@/hooks/mutations';

export default function ContactPage() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const contactMutation = useContactForm();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await contactMutation.mutateAsync({ nom, email, sujet: sujet || undefined, message });
      setSent(true);
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez reessayer.');
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-[#111] p-8 rounded border border-[#222] text-center">
          <h1 className="text-2xl font-bold mb-2 text-off-white">Message envoye</h1>
          <p className="text-muted">Merci ! Je vous repondrai dans les plus brefs delais.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-lg mx-auto p-4 py-12">
        <h1 className="text-3xl font-bold mb-2 text-off-white">Contact</h1>
        <p className="text-muted mb-6">Une question, un projet ? Ecrivez-moi.</p>

        <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
          {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
          <div>
            <label htmlFor="contactpage-nom" className="block text-sm font-medium text-off-white">Nom</label>
            <input id="contactpage-nom" name="nom" value={nom} onChange={(e) => setNom(e.target.value)} required autoComplete="name"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="contactpage-email" className="block text-sm font-medium text-off-white">Email</label>
            <input id="contactpage-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              spellCheck={false}
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="contactpage-sujet" className="block text-sm font-medium text-off-white">Sujet</label>
            <input id="contactpage-sujet" name="sujet" value={sujet} onChange={(e) => setSujet(e.target.value)}
              autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="contactpage-message" className="block text-sm font-medium text-off-white">Message</label>
            <textarea id="contactpage-message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
              autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <button type="submit" disabled={contactMutation.isPending}
            className="w-full bg-acid text-black py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {contactMutation.isPending ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}
