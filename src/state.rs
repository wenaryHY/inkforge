use std::path::PathBuf;

use sqlx::SqlitePool;

use crate::bootstrap::config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub config: AppConfig,
    pub upload_dir: PathBuf,
    pub theme_dir: PathBuf,
    pub admin_dist_dir: PathBuf,
}

impl AppState {
    pub fn new(config: AppConfig, pool: SqlitePool) -> anyhow::Result<Self> {
        Ok(Self {
            upload_dir: AppConfig::resolve_path(&config.storage.upload_dir)?,
            theme_dir: AppConfig::resolve_path(&config.theme.theme_dir)?,
            admin_dist_dir: AppConfig::resolve_path(&config.paths.admin_dist_dir)?,
            pool,
            config,
        })
    }
}
