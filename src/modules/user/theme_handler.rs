use std::sync::Arc;

use axum::{
    extract::State,
    response::Html,
};

use crate::{
    shared::error::{AppError, AppResult},
    state::AppState,
};

pub async fn render_profile(
    State(state): State<Arc<AppState>>,
) -> AppResult<Html<String>> {
    let env = crate::modules::theme::engine::build_template_engine(state.clone()).await?;
    let tmpl = env.get_template("profile.html")
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("Template error: {}", e)))?;

    let rendered = tmpl.render(minijinja::context!())
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("Render error: {}", e)))?;

    Ok(Html(rendered))
}
