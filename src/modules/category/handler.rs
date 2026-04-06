use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};

use crate::{
    shared::{
        auth::AdminUser,
        error::AppResult,
        response::ApiResponse,
    },
    state::AppState,
};

use super::{
    domain::Category,
    dto::{CreateCategoryRequest, UpdateCategoryRequest},
    service,
};

pub async fn list_categories(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<Vec<Category>>>> {
    Ok(Json(ApiResponse::success(service::list_categories(state).await?)))
}

pub async fn create_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<CreateCategoryRequest>,
) -> AppResult<Json<ApiResponse<Category>>> {
    Ok(Json(ApiResponse::success(service::create_category(state, body).await?)))
}

pub async fn update_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateCategoryRequest>,
) -> AppResult<Json<ApiResponse<Category>>> {
    Ok(Json(ApiResponse::success(
        service::update_category(state, &id, body).await?,
    )))
}

pub async fn delete_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(service::delete_category(state, &id).await?)))
}
