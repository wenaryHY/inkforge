use std::sync::Arc;

use axum::{
    body::Body,
    extract::{Path, State},
    http::header,
    response::IntoResponse,
    Json,
};

use crate::{
    shared::{auth::AdminUser, error::AppError, response::ApiResponse},
    state::AppState,
};

use super::{
    domain::BackupProvider,
    dto::{BackupScheduleRequest, CreateBackupRequest},
    service,
};

pub async fn create_backup(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<CreateBackupRequest>,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    let provider = BackupProvider::from_str(&body.provider)
        .ok_or_else(|| AppError::BadRequest("provider 仅支持 local / s3".into()))?;
    let data = service::create_backup(state, provider).await?;
    Ok(Json(ApiResponse::success(data)))
}

pub async fn list_backups(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
) -> Result<Json<ApiResponse<Vec<super::dto::BackupListResponse>>>, AppError> {
    let data = service::list_backups(state).await?;
    Ok(Json(ApiResponse::success(data)))
}

pub async fn restore_backup(
    State(state): State<Arc<AppState>>,
    admin: AdminUser,
    req: axum::http::Request<Body>,
) -> Result<Json<ApiResponse<Vec<super::dto::RestoreProgressResponse>>>, AppError> {
    let _ = admin;
    let (_, body) = req.into_parts();
    let bytes = axum::body::to_bytes(body, 64 * 1024 * 1024)
        .await
        .map_err(|e| AppError::BadRequest(format!("failed to read request body: {e}")))?;

    let data = service::restore_backup_from_bytes(state, bytes.to_vec()).await?;
    Ok(Json(ApiResponse::success(data)))
}

pub async fn get_schedule(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
) -> Result<Json<ApiResponse<super::dto::BackupScheduleResponse>>, AppError> {
    let data = service::get_schedule(state).await?;
    Ok(Json(ApiResponse::success(data)))
}

pub async fn update_schedule(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<BackupScheduleRequest>,
) -> Result<Json<ApiResponse<super::dto::BackupScheduleResponse>>, AppError> {
    let data = service::update_schedule(state, body).await?;
    Ok(Json(ApiResponse::success(data)))
}

pub async fn delete_backup(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    let data = service::delete_backup(state, id).await?;
    Ok(Json(ApiResponse::success(data)))
}

pub async fn download_backup(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let backup_dir = state.db_path.parent()
        .ok_or(AppError::NotFound)?
        .join("backups");
    let backup_path = backup_dir.join(&id).join("backup.zip");

    if !backup_path.exists() {
        return Err(AppError::NotFound);
    }

    let file: Vec<u8> = tokio::fs::read(&backup_path)
        .await?;

    Ok((
        [(header::CONTENT_TYPE, "application/zip"), (header::CONTENT_DISPOSITION, "attachment; filename=\"backup.zip\"")],
        file,
    ))
}
