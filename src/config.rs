use anyhow::Result;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub jwt: JwtConfig,
    pub upload: UploadConfig,
    pub paths: PathsConfig,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Deserialize, Clone)]
pub struct DatabaseConfig {
    pub url: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct JwtConfig {
    pub secret: String,
    pub expires_in: i64,
}

#[derive(Debug, Deserialize, Clone)]
pub struct UploadConfig {
    pub dir: String,
    pub max_size_mb: u64,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PathsConfig {
    /// 前台静态资源目录（themes/default/static），支持相对路径（基于 exe 所在目录）
    pub theme_static_dir: String,
    /// 管理后台 React 构建产物目录（src/admin/dist），支持相对路径
    pub admin_dist_dir: String,
}

impl AppConfig {
    pub fn load() -> Result<Self> {
        let cfg = config::Config::builder()
            .add_source(config::File::with_name("config/default").required(false))
            .add_source(config::File::with_name("config/local").required(false))
            .add_source(config::Environment::with_prefix("HALO").separator("__"))
            .set_default("server.host", "0.0.0.0")?
            .set_default("server.port", 3000)?
            .set_default("database.url", "sqlite://data.db?mode=rwc")?
            .set_default("jwt.secret", "change-me-in-production-please")?
            .set_default("jwt.expires_in", 86400 * 7i64)?
            .set_default("upload.dir", "uploads")?
            .set_default("upload.max_size_mb", 10u64)?
            .set_default("paths.theme_static_dir", "themes/default/static")?
            .set_default("paths.admin_dist_dir", "src/admin/dist")?
            .build()?;
        Ok(cfg.try_deserialize()?)
    }
}
