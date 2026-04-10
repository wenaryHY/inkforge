use std::path::PathBuf;
use std::sync::Arc;

use sqlx::SqlitePool;
use tokio::sync::{broadcast, Mutex, RwLock};

use crate::{
    bootstrap::config::AppConfig,
    modules::setup::domain::SetupStage,
    shared::security::LoginRateLimiter,
    ws::ServerEvent,
};

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
    /// Cached site_url from DB, updated on setting change.
    /// Used by CORS, SEO, and theme rendering without hitting DB every request.
    pub site_url: Arc<RwLock<String>>,
    /// Cached admin_url from DB for redirects and theme entry links.
    pub admin_url: Arc<RwLock<String>>,
    /// Cached setup stage used by entry routing and auth guards.
    pub setup_stage: Arc<RwLock<SetupStage>>,
    /// In-memory login rate limiter for basic brute-force protection.
    pub login_rate_limiter: Arc<Mutex<LoginRateLimiter>>,
}

impl AppState {
    pub fn new(
        config: AppConfig,
        pool: SqlitePool,
        event_tx: broadcast::Sender<ServerEvent>,
        site_url: String,
        admin_url: String,
        setup_stage: SetupStage,
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
            site_url: Arc::new(RwLock::new(site_url)),
            admin_url: Arc::new(RwLock::new(admin_url)),
            setup_stage: Arc::new(RwLock::new(setup_stage)),
            login_rate_limiter: Arc::new(Mutex::new(LoginRateLimiter::new())),
        })
    }
}

/// 从 sqlite:// URL 中提取文件路径（支持相对和绝对路径）
fn parse_sqlite_url(url: &str) -> anyhow::Result<PathBuf> {
    let url = url.trim_start_matches("sqlite:");
    let path = if url.starts_with(":////") {
        &url[4..]
    } else if url.starts_with("://") {
        &url[3..]
    } else {
        url
    };
    let path = path.split('?').next().unwrap_or(path);
    let path = path.trim_start_matches('/');
    let path = PathBuf::from(path);
    if path.is_absolute() {
        Ok(path)
    } else {
        Ok(std::env::current_dir()?.join(&path))
    }
}
