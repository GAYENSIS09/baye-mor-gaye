const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TIMEOUT_MS = 15_000;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams}`;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      errorData?.message || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function serializeBody(body?: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  if (body instanceof URLSearchParams) return body.toString();
  return JSON.stringify(body);
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: serializeBody(body) }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: serializeBody(body) }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: serializeBody(body) }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export { ApiError };
