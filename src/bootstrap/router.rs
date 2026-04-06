use std::sync::Arc;

use axum::{
    extract::{Path, State},
    routing::{delete, get, patch, post},
    Router,
};
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    cors::{Any, CorsLayer},
    services::ServeDir,
    trace::TraceLayer,
};

use crate::{admin, modules, state::AppState, ws};

async fn health_check() -> impl axum::response::IntoResponse {
    axum::Json(serde_json::json!({
        "status": "ok"
    }))
}

async fn version_info() -> impl axum::response::IntoResponse {
    axum::Json(serde_json::json!({
        "name": env!("CARGO_PKG_NAME"),
        "version": env!("CARGO_PKG_VERSION")
    }))
}

/// Handler for GET /admin → serves admin.html from dist directory.
pub async fn serve_admin_index(
    State(state): State<Arc<AppState>>,
) -> impl axum::response::IntoResponse {
    admin::admin_static(Path("admin.html".to_string()), State(state)).await
}

pub fn build_router(state: Arc<AppState>) -> Router {
    let upload_dir = state.upload_dir.clone();

    Router::new()
        // TODO: 前台主题渲染路由（阶段8+）
        // .route("/", get(modules::theme::handler::render_home))
        // .route("/posts/:slug", get(modules::theme::handler::render_post))
        // .route("/profile", get(modules::user::theme_handler::render_profile))
        // .route("/static/*path", get(modules::theme::handler::serve_active_static))
        .route("/admin", get(serve_admin_index))
        .route("/admin/*path", get(admin::admin_static))
        .route("/sitemap.xml", get(modules::seo::sitemap::serve_sitemap))
        .route("/robots.txt", get(modules::seo::robots::serve_robots))
        .route("/api/health", get(health_check))
        .route("/api/version", get(version_info))
        .route("/api/auth/register", post(modules::auth::handler::register))
        .route("/api/auth/login", post(modules::auth::handler::login))
        .route("/api/auth/logout", post(modules::auth::handler::logout))
        .route("/api/me", get(modules::user::handler::me))
        .route("/api/me/profile", patch(modules::user::handler::update_profile))
        .route("/api/me/password", patch(modules::user::handler::update_password))
        .route("/api/me/comments", get(modules::comment::handler::my_comments))
        .route(
            "/api/me/comments/:id",
            delete(modules::comment::handler::delete_own_comment),
        )
        .route("/api/posts", get(modules::post::handler::list_public_posts))
        .route("/api/search", get(modules::post::handler::search_posts))
        .route("/api/posts/:slug", get(modules::post::handler::get_public_post))
        .route("/api/categories", get(modules::category::handler::list_categories))
        .route("/api/tags", get(modules::tag::handler::list_tags))
        .route("/api/admin/categories", post(modules::category::handler::create_category))
        .route(
            "/api/admin/categories/:id",
            patch(modules::category::handler::update_category)
                .delete(modules::category::handler::delete_category),
        )
        .route("/api/admin/tags", post(modules::tag::handler::create_tag))
        .route(
            "/api/admin/tags/:id",
            patch(modules::tag::handler::update_tag)
                .delete(modules::tag::handler::delete_tag),
        )
        .route(
            "/api/posts/:slug/comments",
            get(modules::comment::handler::list_post_comments)
                .post(modules::comment::handler::create_comment),
        )
        .route("/api/themes/active", get(modules::theme::handler::active_theme))
        .route("/api/admin/posts", get(modules::post::handler::list_admin_posts))
        .route("/api/admin/posts", post(modules::post::handler::create_post))
        .route(
            "/api/admin/posts/:id",
            get(modules::post::handler::get_admin_post)
                .patch(modules::post::handler::update_post)
                .delete(modules::post::handler::delete_post),
        )
        .route(
            "/api/admin/comments",
            get(modules::comment::handler::list_admin_comments),
        )
        .route(
            "/api/admin/comments/:id/approve",
            post(modules::comment::handler::approve_comment),
        )
        .route(
            "/api/admin/comments/:id/reject",
            post(modules::comment::handler::reject_comment),
        )
        .route(
            "/api/admin/comments/:id",
            delete(modules::comment::handler::delete_comment),
        )
        // ── WebSocket 实时通知路由 ────────────────────────────────────────────
        .route("/ws/admin", get(ws::ws_admin_handler))
        .route("/ws/public", get(ws::ws_public_handler))
        // ─────────────────────────────────────────────────────────────────────
        .route("/api/admin/media", get(modules::media::handler::list_media))
        .route("/api/admin/media", post(modules::media::handler::upload_media))
        .route(
            "/api/admin/media/:id",
            delete(modules::media::handler::delete_media)
                .patch(modules::media::handler::rename_media),
        )
        .route(
            "/api/admin/media/:id/category",
            patch(modules::media::handler::update_media_category),
        )
        .route(
            "/api/admin/media/categories",
            get(modules::media::handler::list_media_categories)
                .post(modules::media::handler::create_media_category),
        )
        .route(
            "/api/admin/media/categories/:id",
            patch(modules::media::handler::update_media_category_crud)
                .delete(modules::media::handler::delete_media_category),
        )
        .route("/api/admin/themes", get(modules::theme::handler::list_themes))
        .route(
            "/api/admin/themes/:slug/detail",
            get(modules::theme::handler::get_theme_detail),
        )
        .route(
            "/api/admin/themes/:slug/config",
            patch(modules::theme::handler::save_theme_config),
        )
        .route(
            "/api/admin/themes/upload",
            post(modules::theme::handler::upload_theme_archive),
        )
        .route(
            "/api/admin/themes/:slug/activate",
            post(modules::theme::handler::activate_theme),
        )
        .route(
            "/api/admin/settings",
            get(modules::setting::handler::list_settings)
                .patch(modules::setting::handler::update_setting),
        )
        .route(
            "/api/admin/backup",
            post(modules::backup::handler::create_backup),
        )
        .route(
            "/api/admin/backup/list",
            get(modules::backup::handler::list_backups),
        )
        .route(
            "/api/admin/backup/restore",
            post(modules::backup::handler::restore_backup),
        )
        .route(
            "/api/admin/backup/schedule",
            get(modules::backup::handler::get_schedule)
                .patch(modules::backup::handler::update_schedule),
        )
        .route(
            "/api/admin/backup/:id",
            delete(modules::backup::handler::delete_backup)
                .get(modules::backup::handler::download_backup),
        )
        .nest_service("/uploads", ServeDir::new(upload_dir))
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer(
                    CorsLayer::new()
                        .allow_origin(Any)
                        .allow_methods(Any)
                        .allow_headers(Any),
                ),
        )
        .with_state(state)
}
