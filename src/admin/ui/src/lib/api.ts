import type { ApiResponse } from '../types';

const API = '';

export function getToken(): string {
  return localStorage.getItem('inkforge_token') || '';
}

export function setToken(token: string): void {
  localStorage.setItem('inkforge_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('inkforge_token');
}

export async function api<T = unknown>(
  path: string,
  opts: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (opts.body && typeof opts.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  if (opts.headers) Object.assign(headers, opts.headers as Record<string, string>);

  const finalOpts: RequestInit = { ...opts, headers };
  const res = await fetch(API + path, finalOpts);
  const data = await res.json();
  return data;
}
