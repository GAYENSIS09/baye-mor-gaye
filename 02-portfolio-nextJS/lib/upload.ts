import { api } from './api';

export async function uploadFile(file: File, folder: string = 'publications') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return api.post<{ url: string; path: string; name: string; size: number; mime: string }>('/upload', formData);
}

export async function uploadImage(file: File, folder: string = 'publications') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  return api.post<{ url: string; path: string; largeur: number | null; hauteur: number | null; taille: number }>('/upload/image', formData);
}
