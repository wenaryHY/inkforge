export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
  request_id: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface AdminPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  content_html: string;
  cover_media_id: string | null;
  status: 'draft' | 'published' | 'trashed';
  visibility: 'public' | 'private';
  category_id: string | null;
  allow_comment: number;
  pinned: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface PublicPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_display_name: string;
  category_name: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  display_name: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  post_title?: string;
  post_slug?: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface MediaItem {
  id: string;
  uploader_id: string;
  kind: 'image' | 'audio';
  mime_type: string;
  original_name: string;
  stored_name: string;
  storage_path: string;
  public_url: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  alt_text: string | null;
  created_at: string;
}

export interface ThemeManifest {
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  min_inkforge_version?: string;
}

export interface ThemeSummary {
  manifest: ThemeManifest;
  active: boolean;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_media_id: string | null;
  bio: string | null;
  role: string;
  status: string;
  theme_preference: 'system' | 'light' | 'dark';
  created_at: string;
  updated_at: string;
}
