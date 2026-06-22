'use client';

import { useState } from 'react';
import { useContactForm } from '@/hooks/mutations';
import { SectionHeader } from '@/components/SectionHeader';
import { ActionButton } from '@/components/ActionBar';

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
          <h1 className="text-2xl font-bold mb-2 text-off-white">Message envoyé</h1>
          <p className="text-muted">Merci ! Je vous répondrai dans les plus brefs délais.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <SectionHeader
        breadcrumb={[{ label: 'Accueil', href: '/' }, { label: 'Contact' }]}
        backHref="/"
        backLabel="Retour à l'accueil"
        title="Contact"
        subtitle="Une question, un projet ? Écrivez-moi."
      />

      <main className="max-w-lg mx-auto p-4 py-8">
        <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
          {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
          <div>
            <label htmlFor="contact-nom" className="label-base">Nom</label>
            <input id="contact-nom" name="nom" value={nom} onChange={(e) => setNom(e.target.value)} required autoComplete="name"
              className="input-base" />
          </div>
          <div>
            <label htmlFor="contact-email" className="label-base">Email</label>
            <input id="contact-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              spellCheck={false}
              className="input-base" />
          </div>
          <div>
            <label htmlFor="contact-sujet" className="label-base">Sujet</label>
            <input id="contact-sujet" name="sujet" value={sujet} onChange={(e) => setSujet(e.target.value)}
              autoComplete="off"
              className="input-base" />
          </div>
          <div>
            <label htmlFor="contact-message" className="label-base">Message</label>
            <textarea id="contact-message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
              autoComplete="off"
              className="input-base" />
          </div>
          <ActionButton type="submit" disabled={contactMutation.isPending} variant="primary" fullWidth>
            {contactMutation.isPending ? 'Envoi...' : 'Envoyer'}
          </ActionButton>
        </form>
      </main>
    </div>
  );
}
