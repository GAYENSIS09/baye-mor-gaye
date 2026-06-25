'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileFormSchema, type ProfileFormData } from '@/schemas/forms';
import { useUpdateProfile } from '@/hooks/mutations';
import MediaViewer from '@/components/MediaViewer';
import { getMediaUrl } from '@/lib/media';
import { ApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CardContainer } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ActionButton, ActionBar } from '@/components/ActionBar';
import { Label } from '@/components/ui/Label';

export default function ProfileDashboardPage() {
  const { utilisateur, loading, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const isOwner = !!utilisateur?.proprietaire;
  const [photoUrl, setPhotoUrl] = useState(getMediaUrl(utilisateur?.photo) ?? '');
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
      email: utilisateur?.email ?? '',
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
      const payload: Record<string, unknown> = { ...data };
      if (photoFile) {
        const reader = new FileReader();
        payload.photo = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });
      }
      const result = await updateProfile.mutateAsync(payload) as { photo?: string };
      setSaved(true);
      setPhotoFile(null);
      const newPhoto = getMediaUrl(result?.photo);
      if (newPhoto) setPhotoUrl(newPhoto);
      await refreshUser();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <SectionHeader title="Profil" subtitle="Gérez vos informations personnelles" />

      <CardContainer className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {saved && <p className="text-green-400 text-sm" role="alert">Profil mis à jour.</p>}

          <div className="flex items-center gap-4 mb-6">
            {(photoUrl || utilisateur.photo) && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#222] shrink-0">
                <MediaViewer src={photoUrl || getMediaUrl(utilisateur.photo) || ''} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="profile-photo">Photo de profil</Label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange}
                className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
              <input type="url" value={photoUrl} onChange={(e) => { setPhotoUrl(e.target.value); setPhotoFile(null); }}
                placeholder="Ou collez une URL d'image" autoComplete="off"
                className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
          </div>

          <div>
            <Label htmlFor="profile-nom">Nom</Label>
            <input id="profile-nom" {...register("nom")} required autoComplete="name"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-email">Email</Label>
            <input id="profile-email" {...register("email")} type="email" autoComplete="email"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {isOwner && (
            <>
              <div>
                <Label htmlFor="profile-titre">Titre professionnel</Label>
                <input id="profile-titre" {...register("titre_professionnel")}
                  placeholder="Ex: Ingénieur logiciel" autoComplete="off"
                  className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
              </div>

              <div>
                <Label htmlFor="profile-bio">Bio</Label>
                <textarea id="profile-bio" {...register("bio")} rows={4} autoComplete="off"
                  className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
              </div>

              <div>
                <Label htmlFor="profile-localisation">Localisation</Label>
                <input id="profile-localisation" {...register("localisation")}
                  placeholder="Ex: Dakar, Senegal" autoComplete="country-name"
                  className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
              </div>

              <div>
                <Label htmlFor="profile-site">Site web</Label>
                <input id="profile-site" {...register("site_web")} type="url" placeholder="https://" autoComplete="url"
                  className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                {errors.site_web && <p className="text-red-400 text-xs mt-1">{errors.site_web.message}</p>}
              </div>

              <div>
                <Label htmlFor="profile-linkedin">LinkedIn</Label>
                <input id="profile-linkedin" {...register("url_linkedin")} type="url" placeholder="https://" autoComplete="url"
                  className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                {errors.url_linkedin && <p className="text-red-400 text-xs mt-1">{errors.url_linkedin.message}</p>}
              </div>

              <div>
                <Label htmlFor="profile-github">GitHub</Label>
                <input id="profile-github" {...register("url_github")} type="url" placeholder="https://" autoComplete="url"
                  className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                {errors.url_github && <p className="text-red-400 text-xs mt-1">{errors.url_github.message}</p>}
              </div>
            </>
          )}

          <ActionBar align="start" gap={3}>
            <ActionButton type="submit" disabled={saving || isSubmitting} variant="primary">
              {saving || isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </ActionButton>
          </ActionBar>
        </form>
      </CardContainer>
    </div>
  );
}