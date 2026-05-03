'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import { useUpdateProfile } from '@/hooks/mutations';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function ProfileDashboardPage() {
  const { utilisateur, loading, logout } = useAuth();
  const updateProfile = useUpdateProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nom, setNom] = useState(utilisateur?.nom ?? '');
  const [bio, setBio] = useState(utilisateur?.proprietaire?.bio ?? '');
  const [titrePro, setTitrePro] = useState(utilisateur?.proprietaire?.titre_professionnel ?? '');
  const [localisation, setLocalisation] = useState(utilisateur?.proprietaire?.localisation ?? '');
  const [siteWeb, setSiteWeb] = useState(utilisateur?.proprietaire?.site_web ?? '');
  const [urlLinkedin, setUrlLinkedin] = useState(utilisateur?.proprietaire?.url_linkedin ?? '');
  const [urlGithub, setUrlGithub] = useState(utilisateur?.proprietaire?.url_github ?? '');
  const [photoUrl, setPhotoUrl] = useState(utilisateur?.photo ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); setPhotoUrl(URL.createObjectURL(file)); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      let photo = photoUrl || undefined;
      if (photoFile) {
        const reader = new FileReader();
        photo = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });
      }
      await updateProfile.mutateAsync({
        nom,
        bio: bio || undefined,
        titre_professionnel: titrePro || undefined,
        localisation: localisation || undefined,
        site_web: siteWeb || undefined,
        url_linkedin: urlLinkedin || undefined,
        url_github: urlGithub || undefined,
        photo,
      });
      setSaved(true);
      setPhotoFile(null);
    } catch {
      console.error('Erreur mise a jour profil');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Profil</h1>

      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        {saved && <p className="text-green-400 text-sm" role="alert">Profil mis a jour.</p>}

        <div>
          <label htmlFor="profile-nom" className="block text-sm font-medium text-off-white">Nom</label>
          <input id="profile-nom" name="nom" value={nom} onChange={(e) => setNom(e.target.value)} required autoComplete="name"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-off-white">Email</label>
          <input id="profile-email" value={utilisateur.email} disabled
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#0A0A0A] text-muted" />
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white mb-1">Photo</label>
          <div className="flex items-center gap-4">
            {(photoUrl || utilisateur.photo) && (
              <img src={photoUrl || utilisateur.photo!} alt=""
                className="w-16 h-16 rounded-full object-cover border border-[#222]" />
            )}
            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange}
                className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
              <input type="url" value={photoUrl} onChange={(e) => { setPhotoUrl(e.target.value); setPhotoFile(null); }}
                placeholder="Ou collez une URL d'image" autoComplete="off"
                className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="profile-titre" className="block text-sm font-medium text-off-white">Titre professionnel</label>
          <input id="profile-titre" name="titre" value={titrePro} onChange={(e) => setTitrePro(e.target.value)}
            placeholder="Ex: Ingenieur logiciel" autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-bio" className="block text-sm font-medium text-off-white">Bio</label>
          <textarea id="profile-bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-localisation" className="block text-sm font-medium text-off-white">Localisation</label>
          <input id="profile-localisation" name="localisation" value={localisation} onChange={(e) => setLocalisation(e.target.value)}
            placeholder="Ex: Dakar, Senegal" autoComplete="country-name"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-site" className="block text-sm font-medium text-off-white">Site web</label>
          <input id="profile-site" name="site_web" value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} type="url" placeholder="https://" autoComplete="url"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-linkedin" className="block text-sm font-medium text-off-white">LinkedIn</label>
          <input id="profile-linkedin" name="url_linkedin" value={urlLinkedin} onChange={(e) => setUrlLinkedin(e.target.value)} type="url" placeholder="https://" autoComplete="url"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-github" className="block text-sm font-medium text-off-white">GitHub</label>
          <input id="profile-github" name="url_github" value={urlGithub} onChange={(e) => setUrlGithub(e.target.value)} type="url" placeholder="https://" autoComplete="url"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
