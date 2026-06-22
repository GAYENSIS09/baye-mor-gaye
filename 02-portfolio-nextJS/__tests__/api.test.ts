import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  });
});

describe('api client - GET', () => {
  it('fait un GET et retourne les donnees', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1, nom: 'Test' }) });
    const { api } = await import('../lib/api');
    const result = await api.get('/test');
    expect(result).toEqual({ id: 1, nom: 'Test' });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test',
      expect.objectContaining({ method: 'GET' })
    );
  });
});

describe('api client - POST', () => {
  it('fait un POST avec body JSON', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1 }) });
    const { api } = await import('../lib/api');
    const result = await api.post('/test', { nom: 'Jean' });
    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ nom: 'Jean' }) })
    );
  });
});

describe('api client - errors', () => {
  it('lance ApiError sur 422', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 422,
      json: () => Promise.resolve({ message: 'Validation error' }),
    });
    const { api, ApiError } = await import('../lib/api');
    await expect(api.get('/test')).rejects.toThrow(ApiError);
  });

  it('lance ApiError sur 500', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 500,
      json: () => Promise.resolve({ message: 'Server Error' }),
    });
    const { api, ApiError } = await import('../lib/api');
    await expect(api.get('/test')).rejects.toThrow(ApiError);
  });

  it('inclut status et data dans ApiError', async () => {
    const errorData = { message: 'Erreur de validation.', errors: { email: ['obligatoire'] } };
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 422,
      json: () => Promise.resolve(errorData),
    });
    const { api, ApiError } = await import('../lib/api');
    try {
      await api.get('/test');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as InstanceType<typeof ApiError>).status).toBe(422);
      expect((e as InstanceType<typeof ApiError>).data).toEqual(errorData);
    }
  });

  it('rejette les erreurs reseau', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { api } = await import('../lib/api');
    await expect(api.get('/test')).rejects.toThrow(TypeError);
  });
});

describe('api client - token', () => {
  it('inclut le token Bearer', async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce('mon-token');
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { api } = await import('../lib/api');
    await api.get('/me');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/me',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mon-token' }),
      })
    );
  });
});

describe('api client - wrapped responses', () => {
  it('deserialise automatiquement {data: ...}', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1, nom: 'Test' }, meta: { total: 1 } }),
    });
    const { api } = await import('../lib/api');
    const result = await api.get('/publications');
    expect(result).toEqual({ data: { id: 1, nom: 'Test' }, total: 1 });
  });

  it('deserialise {data: [...]} en tableau', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1 }, { id: 2 }] }),
    });
    const { api } = await import('../lib/api');
    const result = await api.get('/competences');
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

describe('api client - timeout', () => {
  it('rejette apres 15 secondes', async () => {
    const { api } = await import('../lib/api');
    mockFetch.mockImplementationOnce((_url: string, options: RequestInit) => {
      const controller = options.signal as AbortSignal;
      return new Promise((_, reject) => {
        controller.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });
    await expect(api.get('/test')).rejects.toThrow();
  }, 16000);
});
