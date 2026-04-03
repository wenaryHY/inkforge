use axum::{extract::State, Json};
use std::sync::Arc;

use crate::{
    error::{AppError, AppResult},
    state::AppState,
};

// 允许上传的文件扩展名白名单
const ALLOWED_EXTENSIONS: &[&str] = &[
    "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico",
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
    "txt", "md", "csv", "json", "xml",
    "mp3", "mp4", "webm", "avi", "mov",
    "zip", "rar", "7z", "gz", "tar",
];

pub async fn upload_file(
    State(state): State<Arc<AppState>>,
    mut multipart: axum::extract::Multipart,
) -> AppResult<Json<serde_json::Value>> {
    let field = multipart.next_field().await
        .map_err(|e| AppError::BadRequest(format!("读取文件失败: {}", e)))?
        .ok_or_else(|| AppError::BadRequest("没有找到上传文件".into()))?;

    let filename = field.file_name()
        .ok_or_else(|| AppError::BadRequest("文件名无效".into()))?
        .to_string();

    let safe_ext = std::path::Path::new(&filename)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.chars().filter(|c| c.is_alphanumeric()).take(10).collect::<String>())
        .unwrap_or_else(|| "bin".to_string());

    // 扩展名白名单校验
    if !ALLOWED_EXTENSIONS.contains(&safe_ext.to_lowercase().as_str()) {
        return Err(AppError::BadRequest(format!("不支持的文件类型: .{}", safe_ext)));
    }

    let data = field.bytes().await
        .map_err(|e| AppError::BadRequest(format!("读取文件内容失败: {}", e)))?;

    // 文件大小校验
    let max_bytes = state.max_upload_size * 1024 * 1024;
    if data.len() as u64 > max_bytes {
        return Err(AppError::BadRequest(format!(
            "文件大小超出限制（最大 {}MB）", state.max_upload_size
        )));
    }

    let new_name = format!("{}.{}", uuid::Uuid::new_v4(), safe_ext);

    let dir = std::path::PathBuf::from(&state.upload_dir);
    std::fs::create_dir_all(&dir)?;
    let path = dir.join(&new_name);
    tokio::fs::write(&path, &data).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("写入文件失败: {}", e)))?;

    let url = format!("/uploads/{}", new_name);
    Ok(Json(serde_json::json!({
        "code": 0,
        "message": "上传成功",
        "data": { "url": url, "filename": new_name }
    })))
}
