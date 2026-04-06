use std::sync::Arc;

use axum::{
    extract::State,
    http::header,
    response::IntoResponse,
};

use crate::{
    modules::setting::repository as setting_repository,
    state::AppState,
};

/// Handler for GET /robots.txt
pub async fn serve_robots(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let site_url = match setting_repository::get_string(&state.pool, "site_url", "").await {
        Ok(url) => url,
        Err(_) => String::new(),
    };

    let robots_content = if site_url.is_empty() {
        String::from(
            "User-agent: *\nDisallow: /admin\nDisallow: /api\n",
        )
    } else {
        format!(
            "User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: {}/sitemap.xml\n",
            site_url
        )
    };

    (
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        robots_content,
    )
}
