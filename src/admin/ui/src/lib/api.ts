import type { ApiResponse, PaginatedResponse } from '../types';

const API = '';

export class ApiClientError extends Error {
  code: number;

  constructor(message: string, code = 50000) {
    super(message);
    this.code = code;
  }
}

export function getToken(): string {
  return localStorage.getItem('inkforge_token') || '';
}

export function setToken(token: string): void {
  localStorage.setItem('inkforge_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('inkforge_token');
}

export async function api<T = unknown>(path: string, opts: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers = new Headers(opts.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (opts.body && !(opts.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(API + path, { ...opts, headers });
  const text = await res.text();
  let data: ApiResponse<T>;

  try {
    data = text ? (JSON.parse(text) as ApiResponse<T>) : ({ code: res.ok ? 0 : 50000, message: text || 'Empty response', data: null, request_id: '' } as ApiResponse<T>);
  } catch {
    throw new ApiClientError(text || 'Invalid server response');
  }

  if (!res.ok || data.code !== 0) {
    throw new ApiClientError(data.message || `Request failed with ${res.status}`, data.code);
  }

  return data;
}

export async function apiData<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const response = await api<T>(path, opts);
  return response.data as T;
}

export function paginationPages<T>(payload: PaginatedResponse<T>): number {
  return Math.max(1, Math.ceil(payload.pagination.total / payload.pagination.page_size));
}
