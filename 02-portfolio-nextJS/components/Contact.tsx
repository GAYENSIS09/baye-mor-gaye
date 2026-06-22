"use client";
import { useState } from "react";
import { useContactForm } from "@/hooks/mutations";
import { useProfile } from "@/hooks/useProfile";
import { SectionHeader } from "@/components/SectionHeader";

export default function Contact() {
  const { profile } = useProfile();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const contactMutation = useContactForm();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await contactMutation.mutateAsync({ nom, email, sujet: sujet || undefined, message });
      setSent(true);
    } catch {
      setError("Erreur lors de l'envoi. Veuillez réessayer.");
    }
  }

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader number="05" title="Contact" />

        <div className="border-t border-[#222] pt-16">
          <p className="font-display text-4xl md:text-6xl text-off-white uppercase
                        tracking-tight leading-tight max-w-3xl">
            On construit quelque chose{" "}
            <span className="text-acid">ensemble ?</span>
          </p>

          <div className="mt-12 flex flex-col md:flex-row gap-8 md:gap-16">
            <div>
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
                Email
              </p>
              <a
                href={`mailto:${profile?.email || ""}`}
                className="text-off-white text-lg link-acid"
              >
                {profile?.email || ""}
              </a>
            </div>

            {profile?.url_linkedin && (
              <div>
                <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
                  LinkedIn
                </p>
                <a
                  href={profile.url_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-off-white text-lg link-acid"
                >
                  {profile.url_linkedin.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            <div>
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
                Localisation
              </p>
              <p className="text-off-white text-lg">{profile?.localisation || ""}</p>
            </div>
          </div>

          {sent ? (
            <div className="mt-16 border border-acid/40 rounded-lg p-8 text-center">
              <p className="text-off-white text-xl font-display mb-2">Message envoyé !</p>
              <p className="text-muted text-sm">Merci ! Je vous répondrai dans les plus brefs délais.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-16 max-w-lg space-y-6">
              {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
              <div>
                <label htmlFor="contact-nom" className="label-base">
                  Nom
                </label>
                <input
                  id="contact-nom"
                  name="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  autoComplete="name"
                  aria-describedby="contact-nom-err"
                  className="input-base"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="label-base">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  spellCheck={false}
                  aria-describedby="contact-email-err"
                  className="input-base"
                />
              </div>
              <div>
                <label htmlFor="contact-sujet" className="label-base">
                  Sujet
                </label>
                <input
                  id="contact-sujet"
                  name="sujet"
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  autoComplete="off"
                  aria-describedby="contact-sujet-err"
                  className="input-base"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="label-base">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  autoComplete="off"
                  aria-describedby="contact-msg-err"
                  className="input-base resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={contactMutation.isPending}
                className="inline-flex items-center gap-3 px-8 py-4 bg-acid text-black
                           font-mono text-sm uppercase tracking-widest rounded-full
                           hover:bg-acid-dim transition-colors disabled:opacity-50"
              >
                {contactMutation.isPending ? "Envoi..." : "Envoyer le message →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
