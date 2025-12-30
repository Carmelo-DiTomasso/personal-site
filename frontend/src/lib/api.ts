import { data } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function resolveUrl(path: string) {
  // If caller passes an absolute URL, leave it alone.
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // For local dev, keep using Vite proxy by leaving base empty.
  if (!API_BASE_URL) return path;

  // Avoid double slashes.
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

function friendlyAuthMessage(status: number): string {
  const isDev = import.meta.env.DEV;

  if (status === 401) {
    return isDev
      ? 'You are not logged in. Open /admin and sign in, then refresh.'
      : 'You are not logged in.';
  }

  // 403
  return isDev
    ? 'You do not have permission (403). If this is dev, re-login at /admin and refresh.'
    : 'You do not have permission to do that.';
}

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  status: number;
  statusText: string;
  code?: string;
  details?: unknown;

  constructor(args: {
    status: number;
    statusText: string;
    message: string;
    code?: string;
    details?: unknown;
  }) {
    super(args.message);
    this.name = 'ApiError';
    this.status = args.status;
    this.statusText = args.statusText;
    this.code = args.code;
    this.details = args.details;
  }
}

function isErrorEnvelope(data: unknown): data is ApiErrorEnvelope {
  if (typeof data !== 'object' || data === null) return false;
  if (!('error' in data)) return false;

  const maybeError = (data as { error?: unknown }).error;
  if (typeof maybeError !== 'object' || maybeError === null) return false;

  const { code, message } = maybeError as { code?: unknown; message?: unknown };
  return typeof code === 'string' && typeof message === 'string';
}

export async function apiRequest<T>(
  path: string,
  options?: {
    method?: string;
    signal?: AbortSignal;
    headers?: Record<string, string>;
    body?: unknown;
  },
): Promise<T> {
  const method = options?.method ?? 'GET';

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options?.headers ?? {}),
  };

  const hasBody = options?.body !== undefined;

  const response = await fetch(resolveUrl(path), {
    method,
    signal: options?.signal,
    headers: hasBody
      ? { 'Content-Type': 'application/json', ...headers }
      : headers,
    body: hasBody ? JSON.stringify(options?.body) : undefined,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (response.ok) {
    if (!isJson) {
      // If we ever introduce non-JSON endpoints, we can extend this later.
      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        message: 'Expected JSON response',
      });
    }

    return (await response.json()) as T;
  }

  // Error path
  if (isJson) {
    const isAuthFailure = response.status === 401 || response.status === 403;

    if (isErrorEnvelope(data)) {
      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        code: data.error.code,
        message: isAuthFailure
          ? friendlyAuthMessage(response.status)
          : data.error.message,
        details: data.error.details,
      });
    }

    throw new ApiError({
      status: response.status,
      statusText: response.statusText,
      message: isAuthFailure
        ? friendlyAuthMessage(response.status)
        : `HTTP ${response.status} ${response.statusText}`,
      details: data,
    });
  }

  const isAuthFailure = response.status === 401 || response.status === 403;

  throw new ApiError({
    status: response.status,
    statusText: response.statusText,
    message: isAuthFailure
      ? friendlyAuthMessage(response.status)
      : `HTTP ${response.status} ${response.statusText}`,
  });
}

export function apiGet<T>(path: string, options?: { signal?: AbortSignal }) {
  return apiRequest<T>(path, { method: 'GET', signal: options?.signal });
}
