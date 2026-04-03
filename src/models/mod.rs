use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ─── User ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub display_name: String,
    pub avatar: Option<String>,
    pub bio: Option<String>,
    pub role: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct UserPublic {
    pub id: String,
    pub username: String,
    pub display_name: String,
    pub avatar: Option<String>,
    pub bio: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUser {
    pub username: String,
    pub email: String,
    pub password: String,
    pub display_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

// ─── Category ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub sort_order: i64,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategory {
    pub name: String,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub sort_order: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCategory {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub sort_order: Option<i64>,
}

// ─── Tag ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTag {
    pub name: String,
    pub slug: Option<String>,
}

// ─── Post ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Post {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub excerpt: Option<String>,
    pub content: String,
    pub content_html: String,
    pub cover: Option<String>,
    pub status: String,
    pub post_type: String,
    pub author_id: String,
    pub category_id: Option<String>,
    pub allow_comment: i64,
    pub pinned: i64,
    pub views: i64,
    pub published_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PostWithMeta {
    #[serde(flatten)]
    pub post: Post,
    pub author: Option<UserPublic>,
    pub category: Option<Category>,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePost {
    pub title: String,
    pub slug: Option<String>,
    pub excerpt: Option<String>,
    pub content: String,
    pub cover: Option<String>,
    pub status: Option<String>,
    pub post_type: Option<String>,
    pub category_id: Option<String>,
    pub tag_ids: Option<Vec<String>>,
    pub allow_comment: Option<bool>,
    pub pinned: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePost {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub excerpt: Option<String>,
    pub content: Option<String>,
    pub cover: Option<String>,
    pub status: Option<String>,
    pub category_id: Option<String>,
    pub tag_ids: Option<Vec<String>>,
    pub allow_comment: Option<bool>,
    pub pinned: Option<bool>,
}

// ─── Comment ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Comment {
    pub id: String,
    pub post_id: String,
    pub author_name: String,
    pub author_email: String,
    pub author_url: Option<String>,
    pub content: String,
    pub status: String,
    pub parent_id: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateComment {
    pub post_id: String,
    pub author_name: String,
    pub author_email: String,
    pub author_url: Option<String>,
    pub content: String,
    pub parent_id: Option<String>,
}

// ─── Setting ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub updated_at: String,
}

// ─── Query / Pagination ───────────────────────────────────────────────────────

#[derive(Debug, Deserialize, Default)]
pub struct PostQuery {
    pub page: Option<i64>,
    pub size: Option<i64>,
    pub status: Option<String>,
    pub post_type: Option<String>,
    pub category_id: Option<String>,
    pub tag_id: Option<String>,
    pub keyword: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PageResult<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub size: i64,
    pub pages: i64,
}

impl<T> PageResult<T> {
    pub fn new(items: Vec<T>, total: i64, page: i64, size: i64) -> Self {
        let pages = if size > 0 { (total + size - 1) / size } else { 1 };
        Self { items, total, page, size, pages }
    }
}

// ─── API Response ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub code: i32,
    pub message: String,
    pub data: Option<T>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self { code: 0, message: "ok".into(), data: Some(data) }
    }
}

pub fn new_id() -> String {
    Uuid::new_v4().to_string()
}
