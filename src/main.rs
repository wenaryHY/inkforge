mod admin;
mod config;
mod db;
mod error;
mod handlers;
mod middleware;
mod models;
mod state;
mod ws;

use axum::{routing::{delete, get, post, put}, Router};
use handlers::theme;
use sqlx::SqlitePool;
use state::AppState;
use tokio::sync::broadcast;
use tower::ServiceBuilder;
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::sync::Arc;

/// 将路径解析为绝对路径
/// 优先使用绝对路径；若是相对路径，基于当前工作目录解析
fn resolve_path(path: &str) -> anyhow::Result<String> {
    let p = std::path::Path::new(path);
    if p.is_absolute() {
        Ok(path.to_string())
    } else {
        let cwd = std::env::current_dir()?;
        let resolved = cwd.join(path);
        Ok(resolved.to_string_lossy().to_string())
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "inkforge=info,axum=info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cfg = config::AppConfig::load()?;
    tracing::info!("配置加载完成，监听 {}:{}", cfg.server.host, cfg.server.port);

    // 将 JWT 密钥设置到环境变量，供中间件使用
    if std::env::var("JWT_SECRET").is_err() {
        std::env::set_var("JWT_SECRET", &cfg.jwt.secret);
    }

    std::fs::create_dir_all(&cfg.upload.dir)?;
    let pool = SqlitePool::connect(&cfg.database.url).await?;
    db::run_migrations(&pool).await?;

    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&pool).await?;
    if count == 0 {
        tracing::info!("首次启动，请访问 POST /api/auth/register 创建管理员账户");
    }

    // 创建事件广播通道（容量 256）
    let (event_tx, _) = broadcast::channel::<ws::ServerEvent>(256);

    let app_state = Arc::new(AppState {
        pool,
        upload_dir: cfg.upload.dir.clone(),
        theme_static_dir: resolve_path(&cfg.paths.theme_static_dir)?,
        admin_dist_dir: resolve_path(&cfg.paths.admin_dist_dir)?,
        jwt_secret: cfg.jwt.secret.clone(),
        jwt_expires_in: cfg.jwt.expires_in,
        max_upload_size: cfg.upload.max_size_mb,
        event_tx,
    });

    let uploads_dir = cfg.upload.dir.clone();

    // ═══════════════════════════════════════════════════════════════
    //  路由架构：三层分离 + WebSocket
    // ═══════════════════════════════════════════════════════════════
    //
    //  Layer 1 — 公开路由（无需认证）
    //    GET  /api/posts          → 已发布文章列表（强制 status=published）
    //    GET  /api/categories     → 分类列表
    //    GET  /api/tags           → 标签列表
    //    GET  /api/comments       → 已通过评论（无 post_id 时仅 approved）
    //    POST /api/comments       → 提交评论（status 默认 pending）
    //    GET  /api/settings       → 公开安全的站点设置
    //    POST /api/auth/login     → 登录
    //    POST /api/auth/register  → 注册（需 allow_register=true）
    //
    //  Layer 2 — 认证路由（需要 AuthUser，所有登录用户可用）
    //    POST /api/me             → 当前用户信息
    //    POST /api/posts          → 创建文章
    //    PUT  /api/post/update    → 更新文章（作者或管理员）
    //    DEL  /api/post/delete    → 删除文章（作者或管理员）
    //    GET  /api/upload         → 文件上传
    //
    //  Layer 3 — 管理路由（需要 AdminUser，仅管理员可用）
    //    GET  /api/admin/posts    → 所有状态文章（含草稿）
    //    GET  /api/admin/comments → 所有状态评论（含待审核）
    //    GET  /api/admin/settings → 所有站点设置
    //    PUT  /api/admin/settings → 修改站点设置
    //    PUT  /api/comment/approve → 审核通过评论
    //    DEL  /api/comment/delete  → 删除评论
    //    POST /api/categories      → 创建分类
    //    PUT  /api/category/update → 更新分类
    //    DEL  /api/category/delete → 删除分类
    //    POST /api/tags            → 创建标签
    //    DEL  /api/tag/delete      → 删除标签
    //
    //  WebSocket
    //    GET  /ws/admin?token=xxx  → 管理后台实时推送（需 admin JWT）
    //    GET  /ws/public?post_id=xxx → 前台文章评论实时推送
    //
    // ═══════════════════════════════════════════════════════════════

    let public_routes = Router::new()
        .route("/api/posts", get(handlers::post::list_posts))
        .route("/api/categories", get(handlers::category::list_categories))
        .route("/api/tags", get(handlers::tag::list_tags))
        .route("/api/comments", get(handlers::comment::list_comments))
        .route("/api/comments", post(handlers::comment::create_comment))
        .route("/api/settings", get(handlers::setting::public_settings))
        .route("/api/auth/login", post(handlers::auth::login))
        .route("/api/auth/register", post(handlers::auth::register));

    let auth_routes = Router::new()
        .route("/api/me", post(handlers::auth::me))
        .route("/api/posts", post(handlers::post::create_post))
        .route("/api/post/update", put(handlers::post::update_post))
        .route("/api/post/delete", delete(handlers::post::delete_post))
        .route("/api/upload", post(handlers::upload::upload_file));

    let admin_routes = Router::new()
        .route("/api/admin/posts", get(handlers::post::admin_list_posts))
        .route("/api/admin/comments", get(handlers::comment::admin_list_comments))
        .route("/api/admin/settings", get(handlers::setting::admin_settings))
        .route("/api/admin/settings", put(handlers::setting::update_setting))
        .route("/api/comment/approve", put(handlers::comment::approve_comment))
        .route("/api/comment/delete", delete(handlers::comment::delete_comment))
        .route("/api/categories", post(handlers::category::create_category))
        .route("/api/category/update", put(handlers::category::update_category))
        .route("/api/category/delete", delete(handlers::category::delete_category))
        .route("/api/tags", post(handlers::tag::create_tag))
        .route("/api/tag/delete", delete(handlers::tag::delete_tag));

    let ws_routes = Router::new()
        .route("/ws/admin", get(ws::ws_admin_handler))
        .route("/ws/public", get(ws::ws_public_handler));

    let app = Router::new()
        // 前台页面
        .route("/", get(theme::render_home))
        .route("/post", get(theme::render_post))
        // favicon
        .route("/favicon.ico", axum::routing::get(favicon))
        // 管理后台页面
        .route("/admin", axum::routing::get(admin::admin_page))
        .route("/admin/*path", axum::routing::get(admin::admin_static))
        // WebSocket
        .merge(ws_routes)
        // 合并三层路由
        .merge(public_routes)
        .merge(auth_routes)
        .merge(admin_routes)
        // 静态文件
        .nest_service(
            "/uploads",
            tower_http::services::ServeDir::new(&uploads_dir),
        )
        // 前台静态资源（themes/default/static/）
        .route("/static/*path", get(serve_theme_static))
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer(CorsLayer::permissive()),
        )
        .with_state(app_state);

    let addr = format!("{}:{}", cfg.server.host, cfg.server.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("🎉 InkForge 运行中 → http://{}", addr);

    axum::serve(listener, app).await?;
    Ok(())
}

/// 内嵌 SVG favicon（🦀 Rust 螃蟹）
async fn favicon() -> impl axum::response::IntoResponse {
    use axum::http::header;
    // 用 Rust 🦀 emoji 做一个 SVG favicon
    let svg = r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="85">🦀</text></svg>"#;
    (
        [(header::CONTENT_TYPE, "image/svg+xml")],
        svg,
    )
}

/// 前台静态文件服务（themes/default/static/）
async fn serve_theme_static(
    axum::extract::Path(path): axum::extract::Path<String>,
    state: axum::extract::State<Arc<AppState>>,
) -> impl axum::response::IntoResponse {
    use axum::http::header;
    use axum::response::IntoResponse;
    // 安全检查
    if path.contains("..") || path.contains('\\') || path.starts_with('/') {
        return ([(header::CONTENT_TYPE, "text/plain")], b"403 Forbidden".to_vec()).into_response();
    }

    let base = std::path::PathBuf::from(&state.theme_static_dir);
    let full = base.join(&path);

    // 防止目录穿越
    if !full.starts_with(&base) {
        return ([(header::CONTENT_TYPE, "text/plain")], b"403 Forbidden".to_vec()).into_response();
    }

    let ext = full.extension().and_then(|e| e.to_str()).unwrap_or("");
    let mime = match ext {
        "js" => "application/javascript",
        "css" => "text/css",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" | "svg+xml" => "image/svg+xml",
        "webp" => "image/webp",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        _ => "application/octet-stream",
    };

    match tokio::fs::read(&full).await {
        Ok(data) => (
            [(header::CONTENT_TYPE, mime)],
            data,
        ).into_response(),
        Err(_) => (
            [(header::CONTENT_TYPE, "text/plain")],
            b"Not Found".to_vec(),
        ).into_response(),
    }
}
