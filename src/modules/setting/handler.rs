use std::sync::Arc;

use axum::{extract::State, Json};

use crate::{
    shared::{auth::AdminUser, error::AppResult, response::ApiResponse},
    state::AppState,
};

use super::{
    dto::{SettingItem, UpdateSettingRequest},
    service,
};

pub async fn list_settings(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
) -> AppResult<Json<ApiResponse<Vec<SettingItem>>>> {
    Ok(Json(ApiResponse::success(service::list_settings(state).await?)))
}

pub async fn update_setting(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<UpdateSettingRequest>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::update_setting(state, body).await?,
    )))
}
