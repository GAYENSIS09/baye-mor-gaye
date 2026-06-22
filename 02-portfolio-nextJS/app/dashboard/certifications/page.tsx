'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CertificationFormSchema, type CertificationFormData } from '@/schemas/forms';
import { useCertifications } from '@/hooks/queries';
import { useCreateCertification, useUpdateCertification, useDeleteCertification } from '@/hooks/mutations';
import { Certification } from '@/types/api';
import { useToast } from '@/contexts/ToastContext';
import MediaViewer from '@/components/MediaViewer';
import { getMediaUrl } from '@/lib/media';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Skeleton } from '@/components/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/SectionHeader';
import { ActionButton, IconButton } from '@/components/ActionBar';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

export default function CertificationsPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const { data: certifications = [], isLoading, isError, refetch } = useCertifications();
  const createCert = useCreateCertification();
  const updateCert = useUpdateCertification();
  const deleteCert = useDeleteCertification();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [credentialPreview, setCredentialPreview] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CertificationFormData>({
    resolver: zodResolver(CertificationFormSchema),
    defaultValues: {
      titre: '', organisme: '', description: '', url_credential: '', date_obtention: '', date_expiration: '',
    },
  });

  function resetForm() {
    reset({
      titre: '', organisme: '', description: '', url_credential: '', date_obtention: '', date_expiration: '',
    });
    setEditId(null);
    setShowForm(false);
    setMediaFile(null);
    setMediaPreview('');
    setCredentialFile(null);
    setCredentialPreview('');
  }

  function handleCredentialChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCredentialFile(f);
    const reader = new FileReader();
    reader.onload = () => setCredentialPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function onSubmit(data: CertificationFormData) {
    setSaving(true);
    try {
      const payload = { ...data, description: data.description || undefined, url_credential: data.url_credential || undefined };
      if (mediaFile || credentialFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) fd.append(k, String(v)); });
        if (mediaFile) fd.append('media', mediaFile);
        if (credentialFile) fd.append('credential_file', credentialFile);
        if (editId) {
          fd.append('_method', 'PUT');
          fd.append('id', String(editId));
          await updateCert.mutateAsync(fd);
        } else {
          await createCert.mutateAsync(fd);
        }
      } else {
        if (editId) {
          await updateCert.mutateAsync({ id: editId, ...payload });
        } else {
          await createCert.mutateAsync(payload);
        }
      }
      toast.success(editId ? 'Certification modifiée' : 'Certification ajoutée');
      resetForm();
    } catch { toast.error("Erreur lors de l'enregistrement"); }
    finally { setSaving(false); }
  }

  function startEdit(c: Certification) {
    reset({
      titre: c.titre,
      organisme: c.organisme,
      description: c.description || '',
      date_obtention: c.date_obtention?.split('T')[0] || '',
      date_expiration: c.date_expiration?.split('T')[0] || '',
      url_credential: c.url_credential || '',
    });
    setEditId(c.id);
    setShowForm(true);
    if (c.medias?.length > 0) {
      setMediaPreview(getMediaUrl(c.medias[0].chemin_fichier) || '');
    } else {
      setMediaPreview('');
    }
    setMediaFile(null);
    setCredentialFile(null);
    if (c.url_credential && !c.url_credential.startsWith('http://') && !c.url_credential.startsWith('https://')) {
      setCredentialPreview(getMediaUrl(c.url_credential) || '');
    } else {
      setCredentialPreview('');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        title="Certifications"
        actions={
          <ActionButton variant="primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? 'Annuler' : 'Nouvelle certification'}
          </ActionButton>
        }
      />

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-lg p-4 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            <h3 className="font-body font-semibold text-off-white text-base">{editId ? 'Modifier' : 'Nouvelle'} certification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input id="cert-titre" {...register("titre")} placeholder="Titre *" required autoComplete="off" className="input-base" />
                {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
              </div>
              <div>
                <input id="cert-organisme" {...register("organisme")} placeholder="Organisme *" required autoComplete="off" className="input-base" />
                {errors.organisme && <p className="text-red-400 text-xs mt-1">{errors.organisme.message}</p>}
              </div>
              <div>
                <input id="cert-date" type="date" {...register("date_obtention")} required className="input-base" />
                {errors.date_obtention && <p className="text-red-400 text-xs mt-1">{errors.date_obtention.message}</p>}
              </div>
              <div>
                <input id="cert-url" type="url" {...register("url_credential")} placeholder="URL du justificatif" autoComplete="url" className="input-base" />
                {errors.url_credential && <p className="text-red-400 text-xs mt-1">{errors.url_credential.message}</p>}
              </div>
              <div>
                <input id="cert-expiration" type="date" {...register("date_expiration")} placeholder="Date d'expiration" className="input-base" />
              </div>
            </div>
            <div>
              <textarea id="cert-description" {...register("description")} placeholder="Description" rows={3} autoComplete="off" className="input-base" />
            </div>
            <div>
              <label htmlFor="cert-media" className="label-base">Image (optionnel)</label>
              <input id="cert-media" type="file" accept="image/*" onChange={handleMediaChange} className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
              {mediaPreview && <img src={mediaPreview} alt="" className="mt-2 max-h-32 rounded object-contain border border-[#222]" />}
            </div>
            <div>
              <label htmlFor="cert-credential" className="label-base">Justificatif (optionnel — PDF, image)</label>
              <input id="cert-credential" type="file" accept=".pdf,image/*" onChange={handleCredentialChange} className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
              {credentialPreview && (
                <a href={credentialPreview} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-acid hover:underline mt-1 font-mono">
                  Voir le justificatif <Icons.external className="w-3 h-3" />
                </a>
              )}
              {!credentialPreview && watch('url_credential')?.startsWith('http') && (
                <p className="text-xs text-muted mt-1">Justificatif externe : {watch('url_credential')}</p>
              )}
            </div>
            <ActionButton type="submit" disabled={saving || isSubmitting} variant="primary">
              {saving || isSubmitting ? 'Enregistrement...' : (editId ? 'Modifier' : 'Ajouter')}
            </ActionButton>
          </form>
        </div>
      )}

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement</p>
          <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
        </div>
      ) : isLoading ? (
        <div className="space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="group relative py-8 border-t border-[#222] animate-pulse">
              <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-12">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : certifications.length === 0 ? (
        <EmptyState icon="" title="Aucune certification" message="Ajoutez vos certifications et diplômes complémentaires." actionLabel="Ajouter" onAction={() => { resetForm(); setShowForm(true); }} />
      ) : (
        <div className="space-y-0">
          {certifications.map((c) => (
            <div key={c.id} className="group relative py-8 border-t border-[#222] hover:border-acid/40 transition-colors duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-acid scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-12">
                <div className="self-start">
                  <p className="font-mono text-xs text-muted uppercase tracking-widest">
                    {formatDate(c.date_obtention)}
                  </p>
                </div>
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-off-white text-xl font-body font-medium">{c.titre}</h3>
                          <p className="text-acid font-mono text-sm mt-1">{c.organisme}</p>
                        </div>
                        <span className="tag shrink-0">Certification</span>
                      </div>
                      {c.description && <p className="text-muted text-sm">{c.description}</p>}
                      {c.date_expiration && (
                        <p className="text-xs text-muted mt-1">Expire le {formatDate(c.date_expiration)}</p>
                      )}
                      {c.medias?.length > 0 && (
                        <MediaViewer src={getMediaUrl(c.medias[0].chemin_fichier) ?? ''} alt="" width={200} height={96} className="mt-3 max-h-24 rounded object-contain border border-[#222]" />
                      )}
                      {c.url_credential && (
                        c.url_credential.startsWith('http://') || c.url_credential.startsWith('https://') ? (
                          <a href={c.url_credential} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-acid hover:underline mt-2 font-mono">
                            Voir le certificat <Icons.external className="w-3 h-3" />
                          </a>
                        ) : (
                          <a href={getMediaUrl(c.url_credential) || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-acid hover:underline mt-2 font-mono">
                            Voir le justificatif <Icons.view className="w-3 h-3" />
                          </a>
                        )
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 mt-1">
                      <IconButton onClick={() => startEdit(c)} icon={<Icons.edit className="w-4 h-4" />} label="Modifier" variant="ghost" size="sm" />
                      <IconButton onClick={() => setConfirmDelete(c.id)} icon={<Icons.trash className="w-4 h-4" />} label="Supprimer" variant="danger" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la certification" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteCert.mutateAsync(confirmDelete); toast.success('Certification supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
