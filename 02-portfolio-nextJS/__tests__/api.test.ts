import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('api client', () => {
  it('fait un GET et retourne les donnees', async () => {
    const fakeData = { id: 1, nom: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeData),
    });

    const { api } = await import('../lib/api');
    const result = await api.get('/test');

    expect(result).toEqual(fakeData);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('fait un POST avec un body JSON', async () => {
    const fakeData = { id: 1 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeData),
    });

    const { api } = await import('../lib/api');
    const result = await api.post('/test', { nom: 'Jean' });

    expect(result).toEqual(fakeData);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ nom: 'Jean' }),
      })
    );
  });

  it('lance une erreur sur une reponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ message: 'Validation error' }),
    });

    const { api, ApiError } = await import('../lib/api');

    await expect(api.get('/test')).rejects.toThrow(ApiError);
  });

  it('inclut le token Bearer dans les requetes authentifiees', async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce('mon-token');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { api } = await import('../lib/api');
    await api.get('/me');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mon-token',
        }),
      })
    );
  });
});
