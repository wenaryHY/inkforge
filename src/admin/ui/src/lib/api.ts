import type { ApiResponse, PaginatedResponse } from '../types';

export const API = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `${window.location.protocol}//${window.location.host}`;

/** API version prefix — all API calls use v1 */
export const API_PREFIX = '/api/v1';

export class ApiClientError extends Error {
  code: number;
  clientRequestId?: string;

  constructor(message: string, code = 50000) {
    super(message);
    this.code = code;
  }
}

function generateClientRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
  const clientRequestId = generateClientRequestId();

  headers.set('X-Client-Request-Id', clientRequestId);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (opts.body && !(opts.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(API + path, { ...opts, headers, credentials: 'include' });
  const text = await res.text();
  let data: ApiResponse<T>;

  try {
    data = text ? (JSON.parse(text) as ApiResponse<T>) : ({ code: res.ok ? 0 : 50000, message: text || 'Empty response', data: null, request_id: '' } as ApiResponse<T>);
  } catch {
    const err = new ApiClientError(text || 'Invalid server response');
    err.clientRequestId = clientRequestId;
    throw err;
  }

  if (!res.ok || data.code !== 0) {
    const err = new ApiClientError(data.message || `Request failed with ${res.status}`, data.code);
    err.clientRequestId = clientRequestId;
    throw err;
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

// MediaCategory API
export async function listMediaCategories() {
  return apiData<import('../types').MediaCategory[]>(`${API_PREFIX}/admin/media/categories`);
}

export async function createMediaCategory(data: import('../types').CreateMediaCategoryRequest) {
  return apiData<import('../types').MediaCategory>(`${API_PREFIX}/admin/media/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMediaCategory(id: string, data: import('../types').UpdateMediaCategoryRequest) {
  return apiData<import('../types').MediaCategory>(`${API_PREFIX}/admin/media/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteMediaCategory(id: string) {
  return apiData(`${API_PREFIX}/admin/media/categories/${id}`, {
    method: 'DELETE',
  });
}

// Theme API
export async function getThemeDetail(slug: string) {
  return apiData<import('../types').ThemeDetailResponse>(`${API_PREFIX}/admin/themes/${slug}/detail`);
}

export async function saveThemeConfig(slug: string, config: Record<string, unknown>) {
  return apiData(`${API_PREFIX}/admin/themes/${slug}/config`, {
    method: 'PATCH',
    body: JSON.stringify({ config }),
  });
}

export async function activateTheme(slug: string) {
  return apiData(`${API_PREFIX}/admin/themes/${slug}/activate`, {
    method: 'POST',
  });
}

export async function uploadTheme(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiData<import('../types').ThemeUploadResponse>(`${API_PREFIX}/admin/themes/upload`, {
    method: 'POST',
    body: formData,
  });
}

// Backup API
export async function createBackup(provider: string = 'local') {
  return apiData(`${API_PREFIX}/admin/backup`, {
    method: 'POST',
    body: JSON.stringify({ provider }),
  });
}

export async function listBackups() {
  return apiData<import('../types').BackupListResponse[]>(`${API_PREFIX}/admin/backup/list`);
}

export async function restoreBackup(backupId: string) {
  return apiData(`${API_PREFIX}/admin/backup/restore`, {
    method: 'POST',
    body: JSON.stringify({ backup_id: backupId }),
  });
}

export async function getBackupSchedule() {
  return apiData<import('../types').BackupScheduleResponse>(`${API_PREFIX}/admin/backup/schedule`);
}

export async function updateBackupSchedule(data: import('../types').BackupScheduleRequest) {
  return apiData(`${API_PREFIX}/admin/backup/schedule`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteBackup(id: string) {
  return apiData(`${API_PREFIX}/admin/backup/${id}`, {
    method: 'DELETE',
  });
}

export async function mergeRestoreBackup(id: string) {
  return apiData<import('../types').RestoreProgressResponse[]>(`${API_PREFIX}/admin/backups/${id}/merge-restore`, {
    method: 'POST',
  });
}

// ── 回收站 API ──

export async function listTrash(type?: string) {
  const params = type ? `?type=${type}` : '';
  return apiData<import('../types').TrashItem[]>(`${API_PREFIX}/admin/trash${params}`);
}

export async function restoreTrashItem(itemType: string, id: string) {
  return apiData(`${API_PREFIX}/admin/trash/${itemType}/${id}/restore`, {
    method: 'POST',
  });
}

export async function purgeTrashItem(itemType: string, id: string) {
  return apiData(`${API_PREFIX}/admin/trash/${itemType}/${id}`, {
    method: 'DELETE',
  });
}

export async function purgeExpiredTrash() {
  return apiData(`${API_PREFIX}/admin/trash/purge-expired`, {
    method: 'POST',
  });
}
