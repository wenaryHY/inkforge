use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};

use crate::{
    shared::{
        auth::{AdminUser, AuthUser},
        error::AppResult,
        json::AppJson,
        response::{ApiResponse, PaginatedResponse},
    },
    state::AppState,
};

use super::{
    domain::{AdminCommentItem, CommentItem},
    dto::{CommentQuery, CreateCommentRequest},
    service,
};

pub async fn list_post_comments(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(slug): Path<String>,
) -> AppResult<Json<ApiResponse<Vec<CommentItem>>>> {
    let client_request_id =
        crate::shared::request_id::extract_or_generate_client_request_id(&headers);
    tracing::info!(
        module = "comment",
        event = "list_post_comments_request",
        client_request_id = %client_request_id,
        slug = %slug,
        "listing post comments"
    );
    Ok(Json(ApiResponse::success(
        service::list_post_comments(state, &slug).await?,
    )))
}

pub async fn create_comment(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    auth: AuthUser,
    Path(slug): Path<String>,
    AppJson(body): AppJson<CreateCommentRequest>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    let client_request_id =
        crate::shared::request_id::extract_or_generate_client_request_id(&headers);
    tracing::info!(
        module = "comment",
        event = "create_comment_request",
        client_request_id = %client_request_id,
        slug = %slug,
        user_id = %auth.id,
        "creating comment"
    );
    Ok(Json(ApiResponse::success(
        service::create_comment(state, &auth, &slug, body).await?,
    )))
}

pub async fn my_comments(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Query(query): Query<CommentQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<AdminCommentItem>>>> {
    Ok(Json(ApiResponse::success(
        service::my_comments(state, &auth, query).await?,
    )))
}

pub async fn delete_own_comment(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::delete_own_comment(state, &auth, &id).await?,
    )))
}

pub async fn list_admin_comments(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Query(query): Query<CommentQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<AdminCommentItem>>>> {
    Ok(Json(ApiResponse::success(
        service::list_admin_comments(state, query).await?,
    )))
}

pub async fn approve_comment(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::approve_comment(state, &id).await?,
    )))
}

pub async fn reject_comment(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::reject_comment(state, &id).await?,
    )))
}

pub async fn delete_comment(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::delete_comment(state, &id).await?,
    )))
}

pub async fn restore_comment(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::restore_comment(state, &id).await?,
    )))
}

pub async fn purge_comment(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::purge_comment(state, &id).await?,
    )))
}
