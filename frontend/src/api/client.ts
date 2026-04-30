import { ErrorResponse } from '../types';

function resolveApiBase(): string {
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  if (window.location.hostname.endsWith('.app.github.dev')) {
    const apiHost = window.location.hostname.replace('-3000.', '-8080.');
    return `${window.location.protocol}//${apiHost}/mt_library/api`;
  }

  return 'http://localhost:8080/mt_library/api';
}

const API_BASE =
  resolveApiBase();

export class ApiError extends Error {
  status: number;
  payload: ErrorResponse | null;

  constructor(status: number, payload: ErrorResponse | null, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

interface ApiFetchOptions extends RequestInit {
  skipJsonParsing?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipJsonParsing, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {})
    },
    ...rest
  });

  if (response.status === 204 || skipJsonParsing) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data as ErrorResponse | null);
  }

  return data as T;
}

export function extractErrorMessages(error: unknown): string[] {
  if (error instanceof ApiError) {
    const payload = error.payload;
    if (payload?.errors?.length) {
      return payload.errors.map((item) => item.message);
    }
    if (payload?.message) {
      return [payload.message];
    }
    return [`API error (${error.status})`];
  }
  if (error instanceof Error) {
    return [error.message];
  }
  return ['不明なエラーが発生しました'];
}
