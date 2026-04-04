use serde::{Deserialize, Serialize};

use super::domain::Tag;

#[derive(Debug, Deserialize)]
pub struct PostQuery {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub keyword: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePostRequest {
    pub title: String,
    pub slug: Option<String>,
    pub excerpt: Option<String>,
    pub content_md: String,
    pub cover_media_id: Option<String>,
    pub status: Option<String>,
    pub visibility: Option<String>,
    pub category_id: Option<String>,
    pub tag_ids: Option<Vec<String>>,
    pub allow_comment: Option<bool>,
    pub pinned: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePostRequest {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub excerpt: Option<String>,
    pub content_md: Option<String>,
    pub cover_media_id: Option<String>,
    pub status: Option<String>,
    pub visibility: Option<String>,
    pub category_id: Option<String>,
    pub tag_ids: Option<Vec<String>>,
    pub allow_comment: Option<bool>,
    pub pinned: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct PublicPostResponse {
    #[serde(flatten)]
    pub post: super::domain::PublicPostDetail,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Serialize)]
pub struct AdminPostResponse {
    #[serde(flatten)]
    pub post: super::domain::AdminPost,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub sort_order: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCategoryRequest {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub sort_order: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub name: String,
    pub slug: Option<String>,
}
