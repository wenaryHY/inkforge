use std::sync::Arc;

use crate::{
    modules::{
        post::repository as post_repository,
        setting::repository as setting_repository,
    },
    shared::{
        auth::AuthUser,
        error::{AppError, AppResult},
        pagination::PaginationQuery,
        response::PaginatedResponse,
    },
    state::AppState,
};

use super::{
    domain::{AdminCommentItem, CommentItem},
    dto::{CommentQuery, CreateCommentRequest},
    repository,
};

fn moderation_status(mode: &str, has_approved_comment: bool) -> &'static str {
    match mode {
        "none" => "approved",
        "first_comment" if has_approved_comment => "approved",
        _ => "pending",
    }
}

pub async fn list_post_comments(state: Arc<AppState>, slug: &str) -> AppResult<Vec<CommentItem>> {
    let post = post_repository::find_comment_target(&state.pool, slug)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(repository::list_approved_for_post(&state.pool, &post.id).await?)
}

pub async fn create_comment(
    state: Arc<AppState>,
    auth: &AuthUser,
    slug: &str,
    body: CreateCommentRequest,
) -> AppResult<serde_json::Value> {
    if body.content.trim().is_empty() {
        return Err(AppError::BadRequest("comment content is required".into()));
    }

    let allow_comment = setting_repository::get_bool(&state.pool, "allow_comment", true).await?;
    let require_login = setting_repository::get_bool(&state.pool, "comment_require_login", true).await?;
    if !allow_comment || !require_login {
        return Err(AppError::Forbidden);
    }

    let max_length = setting_repository::get_string(&state.pool, "comment_max_length", "2000").await?;
    let max_length = max_length.parse::<usize>().unwrap_or(2000);
    if body.content.chars().count() > max_length {
        return Err(AppError::BadRequest("comment is too long".into()));
    }

    let post = post_repository::find_comment_target(&state.pool, slug)
        .await?
        .ok_or(AppError::NotFound)?;
    if post.status != "published" || post.visibility != "public" || post.allow_comment == 0 {
        return Err(AppError::Forbidden);
    }

    let moderation_mode = setting_repository::get_string(&state.pool, "comment_moderation_mode", "all").await?;
    let has_approved = repository::count_approved_by_user(&state.pool, &auth.id).await? > 0;
    let status = moderation_status(&moderation_mode, has_approved);

    let comment_id = repository::insert_comment(
        &state.pool,
        &post.id,
        &auth.id,
        body.content.trim(),
        body.parent_id.as_deref(),
        status,
    )
    .await?;

    Ok(serde_json::json!({
        "id": comment_id,
        "status": status,
    }))
}

pub async fn my_comments(
    state: Arc<AppState>,
    auth: &AuthUser,
    query: CommentQuery,
) -> AppResult<PaginatedResponse<AdminCommentItem>> {
    let pagination = PaginationQuery {
        page: query.page,
        page_size: query.page_size,
    };
    let (page, page_size, offset) = pagination.normalized(20, 100);
    let items = repository::list_by_user(&state.pool, &auth.id, page_size, offset).await?;
    let total = repository::count_by_user(&state.pool, &auth.id).await?;
    Ok(PaginatedResponse::new(items, page, page_size, total))
}

pub async fn delete_own_comment(
    state: Arc<AppState>,
    auth: &AuthUser,
    id: &str,
) -> AppResult<serde_json::Value> {
    let deleted = repository::soft_delete_owned(&state.pool, id, &auth.id).await?;
    if !deleted {
        return Err(AppError::NotFound);
    }
    Ok(serde_json::json!({ "deleted": true }))
}

pub async fn list_admin_comments(
    state: Arc<AppState>,
    query: CommentQuery,
) -> AppResult<PaginatedResponse<AdminCommentItem>> {
    let pagination = PaginationQuery {
        page: query.page,
        page_size: query.page_size,
    };
    let (page, page_size, offset) = pagination.normalized(20, 100);
    let items = repository::list_admin(&state.pool, query.status.as_deref(), page_size, offset).await?;
    let total = repository::count_admin(&state.pool, query.status.as_deref()).await?;
    Ok(PaginatedResponse::new(items, page, page_size, total))
}

pub async fn approve_comment(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    repository::update_status(&state.pool, id, "approved").await?;
    Ok(serde_json::json!({ "approved": true }))
}

pub async fn reject_comment(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    repository::update_status(&state.pool, id, "rejected").await?;
    Ok(serde_json::json!({ "rejected": true }))
}

pub async fn delete_comment(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    repository::soft_delete_admin(&state.pool, id).await?;
    Ok(serde_json::json!({ "deleted": true }))
}
