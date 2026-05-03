'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/upload';
import type { MediaQualification } from '@/types/api';

interface MediaUploadManagerProps {
  medias?: MediaQualification[];
  folder?: string;
  onUpload: (url: string) => void;
  onRemove: (id: number) => void;
  entityType: string;
}

export default function MediaUploadManager({ medias, folder = 'qualifications', onUpload, onRemove, entityType }: MediaUploadManagerProps) {
  const [uploading, setUploading] = useState(false);

  const handleFilePick = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const result = await uploadImage(file, folder);
        onUpload(result.url);
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [folder, onUpload]);

  const items = medias ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-off-white font-mono">Médias</span>
        <button type="button" onClick={handleFilePick} disabled={uploading}
          className="text-xs bg-acid text-black px-2 py-1 rounded hover:bg-acid/90 disabled:opacity-50 font-mono">
          {uploading ? 'Téléversement...' : '+ Ajouter un média'}
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((m) => (
            <div key={m.id} className="relative w-16 h-16 rounded overflow-hidden bg-[#222] group">
              {m.type === 'video' ? (
                <video src={m.chemin_fichier} className="object-cover w-full h-full" />
              ) : (
                <Image src={m.chemin_fichier} alt={m.titre || ''} fill className="object-cover" />
              )}
              <button type="button" onClick={() => onRemove(m.id)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500/80 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Supprimer">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      {items.length === 0 && !uploading && (
        <p className="text-xs text-muted">Aucun média associé.</p>
      )}
    </div>
  );
}
