import { api } from './api';

export async function uploadFile(file: File, folder: string = 'publications') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/upload`, {
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

  return response.json() as Promise<{
    url: string;
    path: string;
    name: string;
    size: number;
    mime: string;
  }>;
}

export async function uploadImage(file: File, folder: string = 'publications') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

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

  return response.json() as Promise<{
    url: string;
    path: string;
    largeur: number | null;
    hauteur: number | null;
    taille: number;
  }>;
}
