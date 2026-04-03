use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::{AdminUser, AuthUser},
    models::{ApiResponse, Setting},
    state::AppState,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingUpdate {
    pub key: String,
    pub value: String,
}

// 允许通过 API 修改的设置 key 白名单
const ALLOWED_SETTINGS: &[&str] = &[
    "site_title",
    "site_description",
    "site_url",
    "posts_per_page",
    "allow_register",
    "allow_comment",
];

// GET /api/settings (公开)
pub async fn public_settings(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<Vec<Setting>>>> {
    // 公开接口只返回安全的设置项
    let settings = sqlx::query_as::<_, Setting>(
        "SELECT key, value, updated_at FROM settings WHERE key IN ('site_title', 'site_description', 'site_url')"
    )
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(ApiResponse::ok(settings)))
}

// GET /api/admin/settings (需登录)
pub async fn admin_settings(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
) -> AppResult<Json<ApiResponse<Vec<Setting>>>> {
    let settings = sqlx::query_as::<_, Setting>("SELECT * FROM settings")
        .fetch_all(&state.pool)
        .await?;
    Ok(Json(ApiResponse::ok(settings)))
}

// PUT /api/admin/settings (需 admin)
pub async fn update_setting(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<SettingUpdate>,
) -> AppResult<Json<serde_json::Value>> {
    // 白名单校验
    if !ALLOWED_SETTINGS.contains(&body.key.as_str()) {
        return Err(AppError::BadRequest(format!("不允许修改设置项: {}", body.key)));
    }

    sqlx::query(
        "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')"
    )
    .bind(&body.key).bind(&body.value)
    .execute(&state.pool)
    .await?;

    Ok(serde_json::json!({ "code": 0, "message": "更新成功" }).into())
}
