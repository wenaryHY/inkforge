use std::{path::PathBuf, sync::Arc};

use axum::{
    extract::{Multipart, Path, State},
    http::header,
    response::{Html, IntoResponse},
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

use super::{domain::ThemeSummary, service};

pub async fn active_theme(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    let slug = service::active_theme_slug(state.as_ref()).await?;
    Ok(Json(ApiResponse::success(serde_json::json!({ "slug": slug }))))
}

pub async fn list_themes(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
) -> AppResult<Json<ApiResponse<Vec<ThemeSummary>>>> {
    Ok(Json(ApiResponse::success(service::list_themes(state).await?)))
}

pub async fn activate_theme(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(slug): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    service::activate_theme(state, &slug).await?;
    Ok(Json(ApiResponse::success(serde_json::json!({ "activated": slug }))))
}

pub async fn upload_theme_archive(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    multipart: Multipart,
) -> AppResult<Json<ApiResponse<ThemeSummary>>> {
    Ok(Json(ApiResponse::success(
        service::upload_theme_archive(state, multipart).await?,
    )))
}

pub async fn render_home(
    State(state): State<Arc<AppState>>,
) -> AppResult<Html<String>> {
    let payload = service::home_payload(state.clone()).await?;
    Ok(Html(service::render_template(state, "index.html", payload).await?))
}

pub async fn render_post(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> AppResult<Html<String>> {
    let payload = service::post_payload(state.clone(), &slug).await?;
    Ok(Html(service::render_template(state, "post.html", payload).await?))
}

pub async fn serve_active_static(
    State(state): State<Arc<AppState>>,
    Path(path): Path<String>,
) -> impl IntoResponse {
    if path.contains("..") || path.contains('\\') || path.starts_with('/') {
        return ([(header::CONTENT_TYPE, "text/plain")], b"403 Forbidden".to_vec()).into_response();
    }

    let slug = match service::active_theme_slug(state.as_ref()).await {
        Ok(value) => value,
        Err(_) => return ([(header::CONTENT_TYPE, "text/plain")], b"500 Internal Server Error".to_vec()).into_response(),
    };
    let file_path: PathBuf = state.theme_dir.join(slug).join("static").join(&path);
    let mime = match file_path.extension().and_then(|ext| ext.to_str()).unwrap_or("") {
        "css" => "text/css",
        "js" => "application/javascript",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "mp3" => "audio/mpeg",
        "ogg" => "audio/ogg",
        "wav" => "audio/wav",
        _ => "application/octet-stream",
    };

    match tokio::fs::read(&file_path).await {
        Ok(data) => ([(header::CONTENT_TYPE, mime)], data).into_response(),
        Err(_) => ([(header::CONTENT_TYPE, "text/plain")], b"404 Not Found".to_vec()).into_response(),
    }
}
