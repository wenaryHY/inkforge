use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    Json,
};

use crate::{
    shared::{
        auth::AdminUser,
        error::AppResult,
        response::{ApiResponse, PaginatedResponse},
    },
    state::AppState,
};

use super::{
    dto::{
        AdminPostResponse, CreatePostRequest, PostQuery,
        PublicPostResponse, SearchQuery,
    },
    service,
};

pub async fn list_public_posts(
    State(state): State<Arc<AppState>>,
    Query(query): Query<PostQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<super::domain::PublicPostSummary>>>> {
    Ok(Json(ApiResponse::success(
        service::list_public_posts(state, query).await?,
    )))
}

pub async fn get_public_post(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> AppResult<Json<ApiResponse<PublicPostResponse>>> {
    Ok(Json(ApiResponse::success(service::get_public_post(state, &slug).await?)))
}

/// GET /api/search — FTS5 full-text search for public posts
pub async fn search_posts(
    State(state): State<Arc<AppState>>,
    Query(query): Query<SearchQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<super::domain::PublicPostSummary>>>> {
    Ok(Json(ApiResponse::success(
        service::search_posts(state, query).await?,
    )))
}

pub async fn list_admin_posts(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Query(query): Query<PostQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<AdminPostResponse>>>> {
    Ok(Json(ApiResponse::success(
        service::list_admin_posts(state, query).await?,
    )))
}

pub async fn get_admin_post(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<AdminPostResponse>>> {
    Ok(Json(ApiResponse::success(service::get_admin_post(state, &id).await?)))
}

pub async fn create_post(
    State(state): State<Arc<AppState>>,
    admin: AdminUser,
    Json(body): Json<CreatePostRequest>,
) -> AppResult<Json<ApiResponse<AdminPostResponse>>> {
    Ok(Json(ApiResponse::success(
        service::create_post(state, &admin.0, body).await?,
    )))
}

pub async fn update_post(
    State(state): State<Arc<AppState>>,
    admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<super::dto::UpdatePostRequest>,
) -> AppResult<Json<ApiResponse<AdminPostResponse>>> {
    Ok(Json(ApiResponse::success(
        service::update_post(state, &admin.0, &id, body).await?,
    )))
}

pub async fn delete_post(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(service::delete_post(state, &id).await?)))
}
