use std::sync::Arc;

use axum::{extract::State, Json};

use crate::{
    shared::{
        auth::AdminUser,
        error::{AppError, AppResult},
        response::ApiResponse,
    },
    state::AppState,
};

use super::{dto::{SettingItem, UpdateSettingRequest}, repository};

const ALLOWED_SETTINGS: &[&str] = &[
    "site_title",
    "site_description",
    "site_url",
    "allow_register",
    "allow_comment",
    "comment_require_login",
    "comment_moderation_mode",
    "comment_trusted_after_approved",
    "comment_max_length",
    "active_theme",
    "theme_default_mode",
];

pub async fn list_settings(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
) -> AppResult<Json<ApiResponse<Vec<SettingItem>>>> {
    Ok(Json(ApiResponse::success(repository::list(&state.pool).await?)))
}

pub async fn update_setting(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<UpdateSettingRequest>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    if !ALLOWED_SETTINGS.contains(&body.key.as_str()) {
        return Err(AppError::BadRequest("setting key is not writable".into()));
    }

    repository::upsert(&state.pool, &body.key, &body.value).await?;
    Ok(Json(ApiResponse::success(serde_json::json!({ "updated": true }))))
}
