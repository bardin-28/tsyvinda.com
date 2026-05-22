import { AUTH_COOKIES, hasCookie } from '@/shared/lib/cookies';

export const API_URL = '/api';

const isServer = typeof window === 'undefined';
const SERVER_API_ORIGIN = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  _isRetry?: boolean;
};

const buildUrl = (path: string, params?: RequestOptions['params']) => {
  const search = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        search.append(key, String(value));
      }
    }
  }

  const base = isServer ? SERVER_API_ORIGIN : API_URL;
  const query = search.toString();
  return query ? `${base}${path}?${query}` : `${base}${path}`;
};

const refreshTokens = async () => {
  const base = isServer ? SERVER_API_ORIGIN : API_URL;
  const response = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh tokens');
  }
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, params, headers, _isRetry, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('X-Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
      serializedBody = body as BodyInit;
    } else {
      serializedBody = JSON.stringify(body);
      if (!finalHeaders.has('Content-Type')) {
        finalHeaders.set('Content-Type', 'application/json');
      }
    }
  }

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
    body: serializedBody,
  });

  if (response.status === 401 && !_isRetry && hasCookie(AUTH_COOKIES.SESSION_FLAG)) {
    try {
      await refreshTokens();
      return request<T>(path, { ...options, _isRetry: true });
    } catch (e) {
      console.log('UNAUTHORIZED');
      throw e;
    }
  }

  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    throw new ApiError(response.statusText || 'Request failed', response.status, data);
  }

  return data as T;
};

export const API = {
  request,
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
