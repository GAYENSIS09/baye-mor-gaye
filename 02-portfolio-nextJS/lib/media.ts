const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const STORAGE_URL = API_BASE.replace('/api', '/storage');

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
  let url = `${STORAGE_URL}/${path.replace(/^\/*/, '').replace(/^storage\//, '')}`;
  if (bust) url += `?t=${bust}`;
  return url;
}

export function decodeHtmlEntities(str: string): string {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

export function processContentImages(html: string): string {
  return html.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const baseUrl = API_BASE.replace('/api', '');
      if (src.startsWith(baseUrl)) {
        const relative = src.replace(baseUrl, '');
        const resolved = getMediaUrl(relative.replace(/^\//, ''));
        if (resolved) {
          return match.replace(`src="${src}"`, `src="${resolved}"`);
        }
      }
      return match;
    }
    const resolved = getMediaUrl(src.replace(/^\//, ''));
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
