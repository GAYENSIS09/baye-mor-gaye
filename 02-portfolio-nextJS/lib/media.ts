const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const STORAGE_URL = API_BASE.replace('/api', '/storage');

export function getMediaUrl(path: string | null | undefined, bust?: string | number | null): string | null {
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (bust && !path.includes('t=')) {
      const sep = path.includes('?') ? '&' : '?';
      return `${path}${sep}t=${bust}`;
    }
    return path;
  }
  let url = `${STORAGE_URL}/${path.replace(/^\//, '')}`;
  if (bust) url += `?t=${bust}`;
  return url;
}

export function processContentImages(html: string): string {
  return html.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
    const cleanSrc = src.replace(API_BASE.replace('/api', ''), '').replace(/^\//, '');
    const resolved = getMediaUrl(cleanSrc);
    if (resolved && resolved !== src) {
      return match.replace(`src="${src}"`, `src="${resolved}"`);
    }
    return match;
  });
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
