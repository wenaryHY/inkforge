use axum::{
    extract::{Path, State},
    http::header,
    response::IntoResponse,
};
use std::sync::Arc;
use crate::state::AppState;

pub async fn admin_page() -> impl IntoResponse {
    let html = include_str!("./admin.html");
    (
        [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
        html,
    )
}

/// 管理后台 React 构建产物静态文件服务
pub async fn admin_static(
    Path(path): Path<String>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    // 安全检查：防止目录穿越
    if path.contains("..") || path.contains('\\') || path.starts_with('/') {
        return (
            [(header::CONTENT_TYPE, "text/plain")],
            b"403 Forbidden".to_vec(),
        ).into_response();
    }

    // MIME 类型映射
    let ext = path.rsplit('.').next().unwrap_or("");
    let mime = match ext {
        "html" => "text/html; charset=utf-8",
        "css" => "text/css",
        "js" => "application/javascript",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "eot" => "application/vnd.ms-fontobject",
        "ico" => "image/x-icon",
        "map" => "application/json",
        _ => "application/octet-stream",
    };

    // 从 State 读取配置的 admin_dist_dir（绝对路径）
    let full_path = format!("{}\\{}", state.admin_dist_dir, path);

    match tokio::fs::read(&full_path).await {
        Ok(d) => (
            [(header::CONTENT_TYPE, mime)],
            d,
        ).into_response(),
        Err(_) => (
            [(header::CONTENT_TYPE, "text/plain")],
            b"404 Not Found".to_vec(),
        ).into_response(),
    }
}
