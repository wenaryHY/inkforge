use std::sync::Arc;

use axum::{
    extract::{Multipart, Path, Query, State},
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

use super::{domain::MediaItem, dto::MediaQuery, service};

pub async fn list_media(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Query(query): Query<MediaQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<MediaItem>>>> {
    Ok(Json(ApiResponse::success(service::list_media(state, query).await?)))
}

pub async fn upload_media(
    State(state): State<Arc<AppState>>,
    admin: AdminUser,
    multipart: Multipart,
) -> AppResult<Json<ApiResponse<MediaItem>>> {
    Ok(Json(ApiResponse::success(
        service::upload_media(state, &admin.0, multipart).await?,
    )))
}

pub async fn delete_media(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(service::delete_media(state, &id).await?)))
}
