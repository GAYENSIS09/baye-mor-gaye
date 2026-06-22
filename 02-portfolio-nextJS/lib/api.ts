import { z } from 'zod/v4';
import { Logger, generateTraceId } from './logger';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TIMEOUT_MS = 15_000;

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  traceId?: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  traceId: string;

  constructor(message: string, status: number, data: unknown, traceId: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.traceId = traceId;
  }
}

function isWrappedResponse(data: unknown): data is { data: unknown; meta?: unknown; links?: unknown } {
  if (typeof data !== 'object' || data === null) return false;
  if (!('data' in data)) return false;
  if ('meta' in data || 'links' in data) return false;
  return true;
}

function normalizePaginatedResponse(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;
  if (!('data' in raw) || !('meta' in raw)) return raw;
  const { data, meta } = raw as { data: unknown; meta: Record<string, unknown> };
  return { data, ...meta };
}

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const safe = { ...headers };
  if (safe['Authorization']) safe['Authorization'] = safe['Authorization'].slice(0, 24) + '...';
  return safe;
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions & { schema?: z.ZodType<T> } = {},
): Promise<T> {
  const { params, schema, traceId: externalTraceId, ...fetchOptions } = options;

  const traceId = externalTraceId || generateTraceId('api');
  const log = new Logger(traceId);

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams}`;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Trace-Id': traceId,
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isForm = options.body instanceof FormData;
  log.debug('REQUEST', {
    method: fetchOptions.method || 'GET',
    endpoint,
    queryString: params ? `?${new URLSearchParams(params)}` : '',
    headers: sanitizeHeaders({ ...headers }),
    bodyType: isForm ? 'FormData' : options.body !== undefined ? typeof options.body : undefined,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      log.error('REQUEST_FAILED', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new ApiError(
        errorData?.message || errorData?.error?.message || `HTTP ${response.status}`,
        response.status,
        errorData,
        traceId,
      );
    }

    if (response.status === 204) {
      log.info('RESPONSE_204', { status: 204 });
      return undefined as T;
    }

    const raw: unknown = await response.json();
    let data = isWrappedResponse(raw) ? raw.data : raw;
    data = normalizePaginatedResponse(data);

    log.info('RESPONSE_OK', {
      status: response.status,
      size: JSON.stringify(data).length,
    });

    if (schema) {
      return schema.parse(data);
    }

    return data as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    log.error('REQUEST_ERROR', {
      error: err instanceof Error ? { name: err.name, message: err.message } : String(err),
    });
    throw err;
  }
}

function serializeBody(body?: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  if (body instanceof URLSearchParams) return body.toString();
  return JSON.stringify(body);
}

function opts(options?: RequestOptions): RequestOptions {
  return { ...options };
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions & { schema?: z.ZodType<T> }) =>
    request<T>(endpoint, { ...opts(options), method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions & { schema?: z.ZodType<T> }) =>
    request<T>(endpoint, { ...opts(options), method: 'POST', body: serializeBody(body) }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions & { schema?: z.ZodType<T> }) =>
    request<T>(endpoint, { ...opts(options), method: 'PUT', body: serializeBody(body) }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions & { schema?: z.ZodType<T> }) =>
    request<T>(endpoint, { ...opts(options), method: 'PATCH', body: serializeBody(body) }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions & { schema?: z.ZodType<T> }) =>
    request<T>(endpoint, { ...opts(options), method: 'DELETE' }),
};


