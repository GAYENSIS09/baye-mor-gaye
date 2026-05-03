'use client';
import { useState, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/ui/Icons';

interface DropzoneProps {
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
  currentImage?: string;
}

export default function Dropzone({ onUpload, accept = 'image/*', label = 'Glissez-déposez une image ou cliquez', currentImage }: DropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setError(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'publications');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const imageSrc = preview || currentImage;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Zone de téléchargement d'image"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      className="relative border-2 border-dashed border-[#333] rounded-lg p-8 text-center cursor-pointer hover:border-acid/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
      {imageSrc ? (
        <div className="relative">
          <img
            src={imageSrc}
            alt="Aperçu"
            className="max-h-48 mx-auto rounded object-contain"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
              <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted">
          <Icons.download className="w-10 h-10 mx-auto mb-3" aria-hidden />
          <p className="text-sm">{label}</p>
        </div>
      )}
      {uploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#222] rounded-b-lg overflow-hidden">
          <div className="h-full bg-acid rounded-b-lg animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
      {error && (
        <p className="mt-2 text-red-400 text-sm" role="alert">{error}</p>
      )}
    </div>
  );
}
