import DOMPurify from 'dompurify'

const purify = typeof window !== 'undefined' ? DOMPurify(window) : null

export function sanitizeHtml(dirty: string): string {
  return purify?.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'blockquote',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'style'],
    ALLOW_DATA_ATTR: false,
  }) ?? ''
}

export function sanitizeText(dirty: string): string {
  return purify?.sanitize(dirty, { ALLOWED_TAGS: [] }) ?? ''
}
