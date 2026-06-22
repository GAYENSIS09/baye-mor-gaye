import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  vi.clearAllMocks();
});

vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockLocalStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
  removeItem: (key: string) => { delete mockLocalStorage[key]; },
  clear: () => { Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]); },
  length: 0,
  key: () => null,
});

describe('localStorage auth token', () => {
  it('stocke et recupere un token', () => {
    localStorage.setItem('auth-token', 'test-token-123');
    expect(localStorage.getItem('auth-token')).toBe('test-token-123');
  });

  it('supprime un token', () => {
    localStorage.setItem('auth-token', 'test-token-123');
    localStorage.removeItem('auth-token');
    expect(localStorage.getItem('auth-token')).toBeNull();
  });

  it('retourne null si aucun token', () => {
    expect(localStorage.getItem('auth-token')).toBeNull();
  });
});
