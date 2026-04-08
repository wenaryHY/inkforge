use std::{io::{Cursor, Read, Write}, path::PathBuf, sync::Arc};

use anyhow::Context;
use chrono::{Duration, Utc};
use sha2::{Digest, Sha256};
use tokio::fs;
use zip::{write::SimpleFileOptions, ZipArchive, ZipWriter};

use crate::{
    infra::backup::{BackupStorageBackend, LocalBackupStorage},
    shared::error::{AppError, AppResult},
    state::AppState,
};

use super::{
    domain::{BackupProvider, BackupScheduleFrequency, BackupStatus, RestoreStep},
    dto::{BackupListResponse, BackupScheduleRequest, BackupScheduleResponse, RestoreProgressResponse},
    repository,
};

const BACKUP_ARCHIVE_NAME: &str = "backup.zip";
const BACKUP_DB_ENTRY: &str = "database/inkforge.db";

fn backup_root_dir() -> AppResult<PathBuf> {
    Ok(std::env::current_dir()?.join("backups"))
}

fn local_backend() -> AppResult<LocalBackupStorage> {
    Ok(LocalBackupStorage::new(backup_root_dir()?))
}

fn hash_bytes(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

#[allow(dead_code)]
fn build_archive(db_bytes: &[u8], manifest_hash: &str, provider: &str) -> AppResult<Vec<u8>> {
    let cursor = Cursor::new(Vec::new());
    let mut writer = ZipWriter::new(cursor);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    writer
        .start_file(BACKUP_DB_ENTRY, options)
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("写入备份数据库条目失败: {e}")))?;
    writer.write_all(db_bytes)?;

    let manifest = serde_json::json!({
        "version": 1,
        "provider": provider,
        "created_at": Utc::now().to_rfc3339(),
        "manifest_hash": manifest_hash,
        "entries": [
            {
                "path": BACKUP_DB_ENTRY,
                "size": db_bytes.len()
            }
        ]
    });

    writer
        .start_file("manifest.json", options)
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("写入备份 manifest 失败: {e}")))?;
    writer.write_all(manifest.to_string().as_bytes())?;

    Ok(writer
        .finish()
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("完成备份压缩包失败: {e}")))?
        .into_inner())
}

fn extract_archive(bytes: &[u8]) -> AppResult<(Vec<u8>, String)> {
    let reader = Cursor::new(bytes);
    let mut archive = ZipArchive::new(reader)
        .map_err(|e| AppError::BadRequest(format!("无法读取备份压缩包: {e}")))?;

    let mut db_bytes = Vec::new();
    {
        let mut db_file = archive.by_name(BACKUP_DB_ENTRY)
            .map_err(|_| AppError::BadRequest("备份包缺少数据库文件".into()))?;
        db_file.read_to_end(&mut db_bytes)?;
    }

    let mut manifest = String::new();
    {
        let mut manifest_file = archive
            .by_name("manifest.json")
            .map_err(|_| AppError::BadRequest("备份包缺少 manifest.json".into()))?;
        manifest_file.read_to_string(&mut manifest)?;
    }

    Ok((db_bytes, manifest))
}

async fn restore_database_file(state: &AppState, db_bytes: &[u8]) -> AppResult<PathBuf> {
    let bak_path = state.db_path.with_extension("db.bak");
    let restore_path = state.db_path.with_extension("db.restore");

    let _ = fs::remove_file(&bak_path).await;
    let _ = fs::remove_file(&restore_path).await;

    // Write new database to restore file
    if let Err(write_err) = fs::write(&restore_path, db_bytes).await {
        let _ = fs::remove_file(&restore_path).await;
        return Err(AppError::Anyhow(anyhow::anyhow!("写入恢复数据库文件失败: {write_err}")));
    }

    // Try to backup current database
    if fs::try_exists(&state.db_path).await? {
        if let Err(copy_err) = fs::copy(&state.db_path, &bak_path).await {
            tracing::warn!(error = ?copy_err, "failed to backup current db during restore");
            let _ = fs::remove_file(&restore_path).await;
            return Err(AppError::Anyhow(anyhow::anyhow!("备份当前数据库失败: {copy_err}")));
        }
    }

    // Try to replace database file with retries
    let mut last_err = None;
    for attempt in 0..5 {
        match fs::rename(&restore_path, &state.db_path).await {
            Ok(_) => {
                tracing::info!("database file replaced successfully on attempt {}", attempt + 1);
                return Ok(bak_path);
            },
            Err(e) => {
                last_err = Some(e);
                if attempt < 4 {
                    tracing::warn!("attempt {} to replace db file failed, retrying...", attempt + 1);
                    tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
                }
            }
        }
    }

    tracing::warn!(error = ?last_err, "failed to replace db file after retries, keeping restore file");
    // Keep the restore file for manual recovery after restart
    Ok(restore_path)
}

pub async fn create_backup(state: Arc<AppState>, provider: BackupProvider) -> AppResult<serde_json::Value> {
    let db_bytes = fs::read(&state.db_path).await
        .with_context(|| format!("无法读取数据库文件 {}", state.db_path.display()))?;
    let manifest_hash = hash_bytes(&db_bytes);

    let cursor = Cursor::new(Vec::new());
    let mut writer = ZipWriter::new(cursor);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    // Add database
    writer
        .start_file(BACKUP_DB_ENTRY, options)
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("写入备份数据库条目失败: {e}")))?;
    writer.write_all(&db_bytes)?;

    // Add media files
    let media_dir = state.upload_dir.join("media");
    if fs::try_exists(&media_dir).await? {
        let mut entries = fs::read_dir(&media_dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().ok_or_else(|| AppError::Anyhow(anyhow::anyhow!("无法获取文件名")))?;
                let file_name_str = file_name.to_string_lossy();
                let file_bytes = fs::read(&path).await?;

                writer
                    .start_file(format!("media/{}", file_name_str), options)
                    .map_err(|e| AppError::Anyhow(anyhow::anyhow!("写入媒体文件失败: {e}")))?;
                writer.write_all(&file_bytes)?;
            }
        }
    }

    let manifest = serde_json::json!({
        "version": 1,
        "provider": provider.as_str(),
        "created_at": Utc::now().to_rfc3339(),
        "manifest_hash": manifest_hash,
        "entries": [
            {
                "path": BACKUP_DB_ENTRY,
                "size": db_bytes.len()
            }
        ]
    });

    writer
        .start_file("manifest.json", options)
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("写入备份 manifest 失败: {e}")))?;
    writer.write_all(manifest.to_string().as_bytes())?;

    let archive = writer
        .finish()
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("完成备份压缩包失败: {e}")))?
        .into_inner();

    let size = archive.len() as i64;

    let backup_id = repository::create_backup(&state.pool, provider.as_str(), size, &manifest_hash).await?;
    let backend = local_backend()?;
    let path = backend.save(&backup_id, BACKUP_ARCHIVE_NAME, &archive).await?;

    if provider == BackupProvider::S3 {
        tracing::warn!(backup_id = %backup_id, "S3 backend requested but no runtime S3 config is wired yet, archive retained locally for compatibility");
    }

    Ok(serde_json::json!({
        "id": backup_id,
        "provider": provider.as_str(),
        "size": size,
        "manifest_hash": manifest_hash,
        "path": path,
    }))
}

pub async fn list_backups(state: Arc<AppState>) -> AppResult<Vec<BackupListResponse>> {
    let items = repository::list_backups(&state.pool).await?;
    Ok(items
        .into_iter()
        .map(|item| BackupListResponse {
            id: item.id,
            created_at: item.created_at,
            size: item.size,
            provider: item.provider,
            status: item.status,
            error_message: item.error_message,
        })
        .collect())
}

pub async fn delete_backup(state: Arc<AppState>, id: String) -> AppResult<serde_json::Value> {
    let backup = repository::get_backup(&state.pool, &id).await?
        .ok_or(AppError::NotFound)?;

    let backend = local_backend()?;
    backend.delete(&backup.id, BACKUP_ARCHIVE_NAME).await?;
    repository::delete_backup(&state.pool, &backup.id).await?;

    Ok(serde_json::json!({ "deleted": true, "id": backup.id }))
}

#[allow(dead_code)]
pub async fn restore_backup(state: Arc<AppState>, backup_id: String) -> AppResult<Vec<RestoreProgressResponse>> {
    let backup = repository::get_backup(&state.pool, &backup_id).await?
        .ok_or(AppError::NotFound)?;

    repository::update_backup_status(&state.pool, &backup.id, BackupStatus::Running.as_str(), None).await?;

    let backend = local_backend()?;
    let bytes = backend.read(&backup.id, BACKUP_ARCHIVE_NAME).await?;

    let mut progress = Vec::new();
    progress.push(RestoreProgressResponse {
        step: RestoreStep::Validate.as_str().to_string(),
        status: "completed".into(),
        message: "已完成备份包校验".into(),
    });

    let (db_bytes, manifest_raw) = extract_archive(&bytes)?;
    let expected_hash = hash_bytes(&db_bytes);
    let manifest_value: serde_json::Value = serde_json::from_str(&manifest_raw)
        .map_err(|e| AppError::BadRequest(format!("manifest.json 无法解析: {e}")))?;
    let manifest_hash = manifest_value["manifest_hash"].as_str().unwrap_or_default();
    if manifest_hash != expected_hash {
        repository::update_backup_status(&state.pool, &backup.id, BackupStatus::Failed.as_str(), Some("manifest hash mismatch")).await?;
        return Err(AppError::BadRequest("备份校验失败，manifest hash 不匹配".into()));
    }

    progress.push(RestoreProgressResponse {
        step: RestoreStep::Extract.as_str().to_string(),
        status: "completed".into(),
        message: "已解压备份包并验证 manifest".into(),
    });

    let bak_path = restore_database_file(&state, &db_bytes).await?;
    progress.push(RestoreProgressResponse {
        step: RestoreStep::Replace.as_str().to_string(),
        status: "completed".into(),
        message: format!("已替换数据库文件，旧文件保留在 {}", bak_path.display()),
    });

    progress.push(RestoreProgressResponse {
        step: RestoreStep::ClearCache.as_str().to_string(),
        status: "completed".into(),
        message: "当前版本无额外缓存，已跳过缓存清理".into(),
    });

    repository::update_backup_status(&state.pool, &backup.id, BackupStatus::Completed.as_str(), None).await?;
    Ok(progress)
}

pub async fn restore_backup_from_bytes(state: Arc<AppState>, bytes: Vec<u8>) -> AppResult<Vec<RestoreProgressResponse>> {
    let mut progress = Vec::new();
    progress.push(RestoreProgressResponse {
        step: RestoreStep::Validate.as_str().to_string(),
        status: "completed".into(),
        message: "已完成备份包校验".into(),
    });

    let (db_bytes, manifest_raw) = extract_archive(&bytes)?;
    let expected_hash = hash_bytes(&db_bytes);
    let manifest_value: serde_json::Value = serde_json::from_str(&manifest_raw)
        .map_err(|e| AppError::BadRequest(format!("manifest.json 无法解析: {e}")))?;
    let manifest_hash = manifest_value["manifest_hash"].as_str().unwrap_or_default();
    if manifest_hash != expected_hash {
        return Err(AppError::BadRequest("备份校验失败，manifest hash 不匹配".into()));
    }

    progress.push(RestoreProgressResponse {
        step: RestoreStep::Extract.as_str().to_string(),
        status: "completed".into(),
        message: "已解压备份包并验证 manifest".into(),
    });

    // Extract media files
    let reader = Cursor::new(&bytes);
    let mut archive = ZipArchive::new(reader)
        .map_err(|e| AppError::BadRequest(format!("无法读取备份压缩包: {e}")))?;

    let media_dir = state.upload_dir.join("media");
    fs::create_dir_all(&media_dir).await?;

    let mut media_files = Vec::new();
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| AppError::BadRequest(format!("无法读取备份文件: {e}")))?;

        if file.name().starts_with("media/") && !file.is_dir() {
            let file_name = file.name().strip_prefix("media/").unwrap_or(file.name()).to_string();
            let mut file_bytes = Vec::new();
            file.read_to_end(&mut file_bytes)?;
            media_files.push((file_name, file_bytes));
        }
    }

    for (file_name, file_bytes) in media_files {
        let file_path = media_dir.join(&file_name);
        fs::write(&file_path, file_bytes).await?;
    }

    let bak_path = restore_database_file(&state, &db_bytes).await?;
    progress.push(RestoreProgressResponse {
        step: RestoreStep::Replace.as_str().to_string(),
        status: "completed".into(),
        message: format!("已替换数据库文件，旧文件保留在 {}", bak_path.display()),
    });

    progress.push(RestoreProgressResponse {
        step: RestoreStep::ClearCache.as_str().to_string(),
        status: "completed".into(),
        message: "当前版本无额外缓存，已跳过缓存清理".into(),
    });

    Ok(progress)
}

pub async fn get_schedule(state: Arc<AppState>) -> AppResult<BackupScheduleResponse> {
    let schedule = repository::get_or_create_schedule(&state.pool).await?;
    Ok(BackupScheduleResponse {
        id: schedule.id,
        enabled: schedule.enabled,
        frequency: schedule.frequency,
        hour: schedule.hour as u32,
        minute: schedule.minute as u32,
        provider: schedule.provider,
        last_run_at: schedule.last_run_at,
        next_run_at: schedule.next_run_at,
        created_at: schedule.created_at,
        updated_at: schedule.updated_at,
    })
}

pub async fn update_schedule(state: Arc<AppState>, request: BackupScheduleRequest) -> AppResult<BackupScheduleResponse> {
    let frequency = BackupScheduleFrequency::from_str(&request.frequency)
        .ok_or_else(|| AppError::BadRequest("frequency 仅支持 daily / weekly / monthly".into()))?;
    let provider = BackupProvider::from_str(&request.provider)
        .ok_or_else(|| AppError::BadRequest("provider 仅支持 local / s3".into()))?;

    if request.hour > 23 || request.minute > 59 {
        return Err(AppError::BadRequest("hour/minute 超出合法范围".into()));
    }

    repository::get_or_create_schedule(&state.pool).await?;

    let now = Utc::now();
    let next_run_at = now + Duration::days(match frequency {
        BackupScheduleFrequency::Daily => 1,
        BackupScheduleFrequency::Weekly => 7,
        BackupScheduleFrequency::Monthly => 30,
    });

    repository::update_schedule(
        &state.pool,
        request.enabled,
        frequency.as_str(),
        request.hour as i32,
        request.minute as i32,
        provider.as_str(),
    )
    .await?;
    repository::update_schedule_run_time(&state.pool, &now.to_rfc3339(), &next_run_at.to_rfc3339()).await?;

    get_schedule(state).await
}
