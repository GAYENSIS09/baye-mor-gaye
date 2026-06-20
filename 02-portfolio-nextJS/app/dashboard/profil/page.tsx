'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileFormSchema, type ProfileFormData } from '@/schemas/forms';
import { useUpdateProfile } from '@/hooks/mutations';
import MediaViewer from '@/components/MediaViewer';
import { getMediaUrl } from '@/lib/media';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function ProfileDashboardPage() {
  const { utilisateur, loading, logout } = useAuth();
  const updateProfile = useUpdateProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(utilisateur?.photo ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      nom: utilisateur?.nom ?? '',
      bio: utilisateur?.proprietaire?.bio ?? '',
      titre_professionnel: utilisateur?.proprietaire?.titre_professionnel ?? '',
      localisation: utilisateur?.proprietaire?.localisation ?? '',
      site_web: utilisateur?.proprietaire?.site_web ?? '',
      url_linkedin: utilisateur?.proprietaire?.url_linkedin ?? '',
      url_github: utilisateur?.proprietaire?.url_github ?? '',
    },
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); setPhotoUrl(URL.createObjectURL(file)); }
  }

  async function onSubmit(data: ProfileFormData) {
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
        ...data,
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        {saved && <p className="text-green-400 text-sm" role="alert">Profil mis a jour.</p>}

        <div>
          <label htmlFor="profile-nom" className="block text-sm font-medium text-off-white">Nom</label>
          <input id="profile-nom" {...register("nom")} required autoComplete="name"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
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
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#222] shrink-0">
                <MediaViewer src={getMediaUrl(photoUrl) || getMediaUrl(utilisateur.photo!) || ''} alt="" width={64} height={64} className="object-cover w-full h-full" />
              </div>
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
          <input id="profile-titre" {...register("titre_professionnel")}
            placeholder="Ex: Ingenieur logiciel" autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-bio" className="block text-sm font-medium text-off-white">Bio</label>
          <textarea id="profile-bio" {...register("bio")} rows={4} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-localisation" className="block text-sm font-medium text-off-white">Localisation</label>
          <input id="profile-localisation" {...register("localisation")}
            placeholder="Ex: Dakar, Senegal" autoComplete="country-name"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="profile-site" className="block text-sm font-medium text-off-white">Site web</label>
          <input id="profile-site" {...register("site_web")} type="url" placeholder="https://" autoComplete="url"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {errors.site_web && <p className="text-red-400 text-xs mt-1">{errors.site_web.message}</p>}
        </div>
        <div>
          <label htmlFor="profile-linkedin" className="block text-sm font-medium text-off-white">LinkedIn</label>
          <input id="profile-linkedin" {...register("url_linkedin")} type="url" placeholder="https://" autoComplete="url"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {errors.url_linkedin && <p className="text-red-400 text-xs mt-1">{errors.url_linkedin.message}</p>}
        </div>
        <div>
          <label htmlFor="profile-github" className="block text-sm font-medium text-off-white">GitHub</label>
          <input id="profile-github" {...register("url_github")} type="url" placeholder="https://" autoComplete="url"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {errors.url_github && <p className="text-red-400 text-xs mt-1">{errors.url_github.message}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || isSubmitting}
            className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving || isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
