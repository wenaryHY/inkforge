use sqlx::SqlitePool;
use tokio::sync::broadcast;
use crate::ws::ServerEvent;

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub upload_dir: String,
    pub theme_static_dir: String,  // 前台静态资源绝对路径
    pub admin_dist_dir: String,    // 管理后台 React 产物绝对路径
    pub jwt_secret: String,
    pub jwt_expires_in: i64,
    pub max_upload_size: u64,
    pub event_tx: broadcast::Sender<ServerEvent>,
}
