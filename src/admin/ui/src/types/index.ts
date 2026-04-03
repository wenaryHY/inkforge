/** API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data: T;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** 文章 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'published' | 'draft';
  category_id: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
}

/** 分类 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/** 标签 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** 评论 */
export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  created_at: string;
  post_title?: string;
  post_slug?: string;
}

/** 设置项 */
export interface Setting {
  key: string;
  value: string;
}

/** 当前用户（从 JWT 解析） */
export interface CurrentUser {
  id: string;
  username: string;
  display_name: string;
  role: string;
}
