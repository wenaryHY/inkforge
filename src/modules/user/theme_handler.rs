use std::{collections::HashMap, sync::Arc};

use axum::{
    extract::State,
    response::Html,
};

use crate::{
    modules::setting::repository as setting_repository,
    shared::error::AppResult,
    state::AppState,
};

pub async fn render_profile(
    State(state): State<Arc<AppState>>,
) -> AppResult<Html<String>> {
    let site_title = setting_repository::get_string(&state.pool, "site_title", "InkForge").await?;
    let site_url = setting_repository::get_string(&state.pool, "site_url", "").await?;

    let _payload = HashMap::from([
        ("site_title", serde_json::json!(site_title)),
        ("site_url", serde_json::json!(site_url)),
    ]);

    // TODO: 实现前台主题渲染（阶段8+）
    Err(crate::shared::error::AppError::BadRequest(
        "Theme rendering not yet implemented".to_string(),
    ))
}
