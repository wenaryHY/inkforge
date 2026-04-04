use std::{path::PathBuf, sync::Arc};

use axum::extract::Multipart;

use crate::{
    shared::{
        auth::AuthUser,
        error::{AppError, AppResult},
        pagination::PaginationQuery,
        response::PaginatedResponse,
    },
    state::AppState,
};

use super::{domain::MediaItem, dto::MediaQuery, repository};

fn classify_file(ext: &str) -> Option<(&'static str, &'static str)> {
    match ext {
        "jpg" | "jpeg" => Some(("image", "image/jpeg")),
        "png" => Some(("image", "image/png")),
        "webp" => Some(("image", "image/webp")),
        "gif" => Some(("image", "image/gif")),
        "mp3" => Some(("audio", "audio/mpeg")),
        "ogg" => Some(("audio", "audio/ogg")),
        "wav" => Some(("audio", "audio/wav")),
        "m4a" => Some(("audio", "audio/mp4")),
        _ => None,
    }
}

pub async fn list_media(
    state: Arc<AppState>,
    query: MediaQuery,
) -> AppResult<PaginatedResponse<MediaItem>> {
    let pagination = PaginationQuery {
        page: query.page,
        page_size: query.page_size,
    };
    let (page, page_size, offset) = pagination.normalized(20, 100);
    let kind = query.kind.as_deref();
    let items = repository::list_media(&state.pool, kind, page_size, offset).await?;
    let total = repository::count_media(&state.pool, kind).await?;
    Ok(PaginatedResponse::new(items, page, page_size, total))
}

pub async fn upload_media(
    state: Arc<AppState>,
    auth: &AuthUser,
    mut multipart: Multipart,
) -> AppResult<MediaItem> {
    let field = multipart
        .next_field()
        .await
        .map_err(|err| AppError::BadRequest(format!("invalid multipart field: {err}")))?
        .ok_or_else(|| AppError::BadRequest("file field is required".into()))?;

    let original_name = field
        .file_name()
        .ok_or_else(|| AppError::BadRequest("file name is required".into()))?
        .to_string();
    let ext = std::path::Path::new(&original_name)
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase())
        .ok_or_else(|| AppError::BadRequest("file extension is required".into()))?;
    let (kind, mime_type) = classify_file(&ext)
        .ok_or_else(|| AppError::BadRequest("unsupported media type".into()))?;

    let bytes = field
        .bytes()
        .await
        .map_err(|err| AppError::BadRequest(format!("failed to read upload: {err}")))?;
    let max_bytes = state.config.storage.max_upload_size_mb * 1024 * 1024;
    if bytes.len() as u64 > max_bytes {
        return Err(AppError::BadRequest(format!(
            "file exceeds max size of {} MB",
            state.config.storage.max_upload_size_mb
        )));
    }

    let stored_name = format!("{}.{}", uuid::Uuid::new_v4(), ext);
    let relative_path = PathBuf::from("media").join(&stored_name);
    let absolute_path = state.upload_dir.join(&relative_path);
    if let Some(parent) = absolute_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    tokio::fs::write(&absolute_path, &bytes).await?;

    let storage_path = relative_path.to_string_lossy().replace('\\', "/");
    let public_url = format!("/uploads/{}", storage_path);
    let id = repository::insert_media(
        &state.pool,
        &auth.id,
        kind,
        mime_type,
        &original_name,
        &stored_name,
        &storage_path,
        &public_url,
        bytes.len() as i64,
    )
    .await?;

    repository::get_media(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)
}

pub async fn delete_media(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    let media = repository::get_media(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)?;
    let absolute_path = state.upload_dir.join(&media.storage_path);
    if absolute_path.exists() {
        tokio::fs::remove_file(&absolute_path).await?;
    }
    repository::delete_media(&state.pool, id).await?;
    Ok(serde_json::json!({ "deleted": true }))
}
