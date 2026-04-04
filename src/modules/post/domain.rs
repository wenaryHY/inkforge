use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub sort_order: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct PublicPostSummary {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub excerpt: Option<String>,
    pub published_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub author_display_name: String,
    pub category_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct PublicPostDetail {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub excerpt: Option<String>,
    pub content_html: String,
    pub allow_comment: i64,
    pub published_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub author_display_name: String,
    pub category_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct AdminPost {
    pub id: String,
    pub author_id: String,
    pub title: String,
    pub slug: String,
    pub excerpt: Option<String>,
    pub content_md: String,
    pub content_html: String,
    pub cover_media_id: Option<String>,
    pub status: String,
    pub visibility: String,
    pub category_id: Option<String>,
    pub allow_comment: i64,
    pub pinned: i64,
    pub published_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, FromRow)]
pub struct CommentTargetPost {
    pub id: String,
    pub status: String,
    pub visibility: String,
    pub allow_comment: i64,
}
