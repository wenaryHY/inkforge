use anyhow::Result;
use serde::Deserialize;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Deserialize)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub auth: AuthConfig,
    pub storage: StorageConfig,
    pub theme: ThemeConfig,
    pub paths: PathsConfig,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AuthConfig {
    pub secret: String,
    pub expires_in_seconds: i64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct StorageConfig {
    pub upload_dir: String,
    pub max_upload_size_mb: u64,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Deserialize)]
pub struct ThemeConfig {
    pub theme_dir: String,
    pub active_theme_fallback: String,
    pub default_mode: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PathsConfig {
    pub admin_dist_dir: String,
}

impl AppConfig {
    pub fn load() -> Result<Self> {
        Ok(config::Config::builder()
            .add_source(config::File::with_name("config/default").required(false))
            .add_source(config::File::with_name("config/local").required(false))
            .add_source(config::Environment::with_prefix("INKFORGE").separator("__"))
            .set_default("server.host", "0.0.0.0")?
            .set_default("server.port", 3000)?
            .set_default("database.url", "sqlite://inkforge.db?mode=rwc")?
            .set_default("auth.secret", "change-me-in-production-please")?
            .set_default("auth.expires_in_seconds", 60 * 60 * 24 * 7)?
            .set_default("storage.upload_dir", "uploads")?
            .set_default("storage.max_upload_size_mb", 10)?
            .set_default("theme.theme_dir", "themes")?
            .set_default("theme.active_theme_fallback", "default")?
            .set_default("theme.default_mode", "system")?
            .set_default("paths.admin_dist_dir", "src/admin/dist")?
            .build()?
            .try_deserialize()?)
    }

    pub fn validate(&self) -> Result<()> {
        const UNSAFE_SECRETS: &[&str] = &[
            "inkforge-change-me-in-production",
            "change-me-in-production-please",
        ];
        if UNSAFE_SECRETS.contains(&self.auth.secret.as_str()) {
            tracing::warn!("⚠️  JWT secret is using default value. Please set INKFORGE__AUTH__SECRET in production!");
        }
        Ok(())
    }

    pub fn resolve_path(raw: &str) -> Result<PathBuf> {
        let path = Path::new(raw);
        if path.is_absolute() {
            return Ok(path.to_path_buf());
        }

        Ok(std::env::current_dir()?.join(path))
    }
}
