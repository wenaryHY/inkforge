use std::path::PathBuf;

use sqlx::SqlitePool;
use tokio::sync::broadcast;

use crate::{bootstrap::config::AppConfig, ws::ServerEvent};

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub config: AppConfig,
    pub upload_dir: PathBuf,
    pub theme_dir: PathBuf,
    pub admin_dist_dir: PathBuf,
    /// Path to the SQLite database file, for backup/restore
    pub db_path: PathBuf,
    /// Broadcast sender for WebSocket real-time notifications (容量 256)
    pub event_tx: broadcast::Sender<ServerEvent>,
}

impl AppState {
    pub fn new(
        config: AppConfig,
        pool: SqlitePool,
        event_tx: broadcast::Sender<ServerEvent>,
    ) -> anyhow::Result<Self> {
        let db_path = parse_sqlite_url(&config.database.url)?;
        Ok(Self {
            upload_dir: AppConfig::resolve_path(&config.storage.upload_dir)?,
            theme_dir: AppConfig::resolve_path(&config.theme.theme_dir)?,
            admin_dist_dir: AppConfig::resolve_path(&config.paths.admin_dist_dir)?,
            db_path,
            pool,
            config,
            event_tx,
        })
    }
}

/// 从 sqlite:// URL 中提取文件路径（支持相对和绝对路径）
fn parse_sqlite_url(url: &str) -> anyhow::Result<PathBuf> {
    // sqlite://relative/path/file.db?mode=... → relative/path/file.db
    // sqlite:///absolute/path/file.db → /absolute/path/file.db
    let url = url.trim_start_matches("sqlite:");
    let path = if url.starts_with(":////") {
        // Absolute Unix path: sqlite:///absolute/path → /absolute/path
        &url[4..]
    } else if url.starts_with("://") {
        // Relative or Windows absolute: sqlite://relative/path or sqlite://C:/path
        &url[3..]
    } else {
        url
    };
    // Remove query string
    let path = path.split('?').next().unwrap_or(path);
    // Normalize path: remove leading slashes for relative paths
    let path = path.trim_start_matches('/');
    let path = PathBuf::from(path);
    if path.is_absolute() {
        Ok(path)
    } else {
        Ok(std::env::current_dir()?.join(&path))
    }
}
