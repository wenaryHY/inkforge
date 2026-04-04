use std::sync::Arc;

use pulldown_cmark::{html, Options, Parser};
use slug::slugify;

use crate::{
    shared::{
        auth::AuthUser,
        error::{AppError, AppResult},
        pagination::PaginationQuery,
        response::PaginatedResponse,
    },
    state::AppState,
};

use super::{
    domain::{AdminPost, Category, PublicPostSummary, Tag},
    dto::{
        AdminPostResponse, CreateCategoryRequest, CreatePostRequest, CreateTagRequest, PostQuery,
        PublicPostResponse, UpdateCategoryRequest, UpdatePostRequest,
    },
    repository,
};

fn markdown_to_html(markdown: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    let parser = Parser::new_ext(markdown, options);
    let mut html_out = String::new();
    html::push_html(&mut html_out, parser);
    html_out
}

fn normalize_status(value: Option<&str>) -> AppResult<String> {
    let status = value.unwrap_or("draft");
    if !matches!(status, "draft" | "published" | "trashed") {
        return Err(AppError::BadRequest("invalid post status".into()));
    }
    Ok(status.to_string())
}

fn normalize_visibility(value: Option<&str>) -> AppResult<String> {
    let visibility = value.unwrap_or("public");
    if !matches!(visibility, "public" | "private") {
        return Err(AppError::BadRequest("invalid visibility".into()));
    }
    Ok(visibility.to_string())
}

async fn attach_admin_post(state: &AppState, post: AdminPost) -> AppResult<AdminPostResponse> {
    let tags = repository::list_post_tags(&state.pool, &post.id).await?;
    Ok(AdminPostResponse { post, tags })
}

pub async fn list_categories(state: Arc<AppState>) -> AppResult<Vec<Category>> {
    Ok(repository::list_categories(&state.pool).await?)
}

pub async fn list_tags(state: Arc<AppState>) -> AppResult<Vec<Tag>> {
    Ok(repository::list_tags(&state.pool).await?)
}

pub async fn create_category(state: Arc<AppState>, body: CreateCategoryRequest) -> AppResult<Category> {
    if body.name.trim().is_empty() {
        return Err(AppError::BadRequest("category name is required".into()));
    }
    let slug = body
        .slug
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| slugify(&body.name));
    if repository::category_slug_or_name_exists(&state.pool, &slug, body.name.trim(), None).await? {
        return Err(AppError::Conflict("category slug or name already exists".into()));
    }
    let id = repository::insert_category(
        &state.pool,
        body.name.trim(),
        &slug,
        body.description.as_deref(),
        body.parent_id.as_deref(),
        body.sort_order.unwrap_or(0),
    )
    .await?;
    repository::get_category(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)
}

pub async fn update_category(
    state: Arc<AppState>,
    id: &str,
    body: UpdateCategoryRequest,
) -> AppResult<Category> {
    let current = repository::get_category(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)?;
    let name = body.name.unwrap_or(current.name.clone());
    let slug = body.slug.unwrap_or(current.slug.clone());
    if repository::category_slug_or_name_exists(&state.pool, &slug, &name, Some(id)).await? {
        return Err(AppError::Conflict("category slug or name already exists".into()));
    }
    repository::update_category(
        &state.pool,
        id,
        &name,
        &slug,
        body.description.as_deref().or(current.description.as_deref()),
        body.parent_id.as_deref().or(current.parent_id.as_deref()),
        body.sort_order.unwrap_or(current.sort_order),
    )
    .await?;
    repository::get_category(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)
}

pub async fn delete_category(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    repository::delete_category(&state.pool, id).await?;
    Ok(serde_json::json!({ "deleted": true }))
}

pub async fn create_tag(state: Arc<AppState>, body: CreateTagRequest) -> AppResult<Tag> {
    if body.name.trim().is_empty() {
        return Err(AppError::BadRequest("tag name is required".into()));
    }
    let slug = body
        .slug
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| slugify(&body.name));
    if repository::tag_slug_or_name_exists(&state.pool, &slug, body.name.trim(), None).await? {
        return Err(AppError::Conflict("tag slug or name already exists".into()));
    }
    let id = repository::insert_tag(&state.pool, body.name.trim(), &slug).await?;
    repository::get_tag(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)
}

pub async fn delete_tag(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    repository::delete_tag(&state.pool, id).await?;
    Ok(serde_json::json!({ "deleted": true }))
}

pub async fn list_public_posts(
    state: Arc<AppState>,
    query: PostQuery,
) -> AppResult<PaginatedResponse<PublicPostSummary>> {
    let pagination = PaginationQuery {
        page: query.page,
        page_size: query.page_size,
    };
    let (page, page_size, offset) = pagination.normalized(10, 100);
    let items = repository::list_public_posts(&state.pool, query.keyword.as_deref(), page_size, offset).await?;
    let total = repository::count_public_posts(&state.pool, query.keyword.as_deref()).await?;
    Ok(PaginatedResponse::new(items, page, page_size, total))
}

pub async fn get_public_post(state: Arc<AppState>, slug: &str) -> AppResult<PublicPostResponse> {
    let post = repository::get_public_post_by_slug(&state.pool, slug)
        .await?
        .ok_or(AppError::NotFound)?;
    let tags = repository::list_post_tags(&state.pool, &post.id).await?;
    Ok(PublicPostResponse { post, tags })
}

pub async fn list_admin_posts(
    state: Arc<AppState>,
    query: PostQuery,
) -> AppResult<PaginatedResponse<AdminPostResponse>> {
    let pagination = PaginationQuery {
        page: query.page,
        page_size: query.page_size,
    };
    let (page, page_size, offset) = pagination.normalized(10, 100);
    let posts = repository::list_admin_posts(
        &state.pool,
        query.status.as_deref(),
        query.keyword.as_deref(),
        page_size,
        offset,
    )
    .await?;
    let total = repository::count_admin_posts(&state.pool, query.status.as_deref(), query.keyword.as_deref()).await?;

    let mut items = Vec::with_capacity(posts.len());
    for post in posts {
        items.push(attach_admin_post(state.as_ref(), post).await?);
    }

    Ok(PaginatedResponse::new(items, page, page_size, total))
}

pub async fn get_admin_post(state: Arc<AppState>, id: &str) -> AppResult<AdminPostResponse> {
    let post = repository::get_admin_post(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)?;
    attach_admin_post(state.as_ref(), post).await
}

pub async fn create_post(
    state: Arc<AppState>,
    auth: &AuthUser,
    body: CreatePostRequest,
) -> AppResult<AdminPostResponse> {
    if body.title.trim().is_empty() {
        return Err(AppError::BadRequest("title is required".into()));
    }

    let slug = body
        .slug
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| slugify(&body.title));
    if repository::slug_exists(&state.pool, &slug, None).await? {
        return Err(AppError::Conflict("post slug already exists".into()));
    }

    let status = normalize_status(body.status.as_deref())?;
    let visibility = normalize_visibility(body.visibility.as_deref())?;
    let content_html = markdown_to_html(&body.content_md);
    let id = repository::insert_post(
        &state.pool,
        &auth.id,
        body.title.trim(),
        &slug,
        body.excerpt.as_deref(),
        &body.content_md,
        &content_html,
        body.cover_media_id.as_deref(),
        &status,
        &visibility,
        body.category_id.as_deref(),
        body.allow_comment.unwrap_or(true),
        body.pinned.unwrap_or(false),
    )
    .await?;

    if let Some(tag_ids) = body.tag_ids {
        repository::replace_tags(&state.pool, &id, &tag_ids).await?;
    }

    get_admin_post(state, &id).await
}

pub async fn update_post(
    state: Arc<AppState>,
    _auth: &AuthUser,
    id: &str,
    body: UpdatePostRequest,
) -> AppResult<AdminPostResponse> {
    let current = repository::get_admin_post(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)?;
    let title = body.title.unwrap_or(current.title.clone());
    let slug = body.slug.unwrap_or(current.slug.clone());
    let excerpt = body.excerpt.or(current.excerpt.clone());
    let content_md = body.content_md.unwrap_or(current.content_md.clone());
    let content_html = markdown_to_html(&content_md);
    let cover_media_id = body.cover_media_id.or(current.cover_media_id.clone());
    let status = normalize_status(body.status.as_deref().or(Some(&current.status)))?;
    let visibility = normalize_visibility(body.visibility.as_deref().or(Some(&current.visibility)))?;
    let category_id = body.category_id.or(current.category_id.clone());
    let allow_comment = body.allow_comment.unwrap_or(current.allow_comment == 1);
    let pinned = body.pinned.unwrap_or(current.pinned == 1);

    if repository::slug_exists(&state.pool, &slug, Some(id)).await? {
        return Err(AppError::Conflict("post slug already exists".into()));
    }

    repository::update_post(
        &state.pool,
        id,
        &title,
        &slug,
        excerpt.as_deref(),
        &content_md,
        &content_html,
        cover_media_id.as_deref(),
        &status,
        &visibility,
        category_id.as_deref(),
        allow_comment,
        pinned,
    )
    .await?;

    if let Some(tag_ids) = body.tag_ids {
        repository::replace_tags(&state.pool, id, &tag_ids).await?;
    }

    get_admin_post(state, id).await
}

pub async fn delete_post(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    repository::delete_post(&state.pool, id).await?;
    Ok(serde_json::json!({ "deleted": true }))
}
