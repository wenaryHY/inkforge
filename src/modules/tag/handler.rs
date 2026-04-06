use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};

use crate::{
    shared::{auth::AdminUser, error::AppResult, response::ApiResponse},
    state::AppState,
};

use super::{
    domain::Tag,
    dto::{CreateTagRequest, UpdateTagRequest},
    service,
};

pub async fn list_tags(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<Vec<Tag>>>> {
    Ok(Json(ApiResponse::success(service::list_tags(state).await?)))
}

pub async fn create_tag(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<CreateTagRequest>,
) -> AppResult<Json<ApiResponse<Tag>>> {
    Ok(Json(ApiResponse::success(service::create_tag(state, body).await?)))
}

pub async fn update_tag(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateTagRequest>,
) -> AppResult<Json<ApiResponse<Tag>>> {
    Ok(Json(ApiResponse::success(
        service::update_tag(state, &id, body).await?,
    )))
}

pub async fn delete_tag(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(service::delete_tag(state, &id).await?)))
}
