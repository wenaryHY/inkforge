use std::sync::Arc;

use axum::{
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

use crate::{admin, modules, state::AppState};

pub fn build_router(state: Arc<AppState>) -> Router {
    let upload_dir = state.upload_dir.clone();

    Router::new()
        .route("/", get(modules::theme::handler::render_home))
        .route("/posts/:slug", get(modules::theme::handler::render_post))
        .route("/static/*path", get(modules::theme::handler::serve_active_static))
        .route("/admin", get(admin::admin_page))
        .route("/admin/*path", get(admin::admin_static))
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
        .route("/api/posts/:slug", get(modules::post::handler::get_public_post))
        .route("/api/categories", get(modules::post::handler::list_categories))
        .route("/api/tags", get(modules::post::handler::list_tags))
        .route("/api/admin/categories", post(modules::post::handler::create_category))
        .route(
            "/api/admin/categories/:id",
            patch(modules::post::handler::update_category)
                .delete(modules::post::handler::delete_category),
        )
        .route("/api/admin/tags", post(modules::post::handler::create_tag))
        .route(
            "/api/admin/tags/:id",
            delete(modules::post::handler::delete_tag),
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
        .route("/api/admin/media", get(modules::media::handler::list_media))
        .route("/api/admin/media", post(modules::media::handler::upload_media))
        .route(
            "/api/admin/media/:id",
            delete(modules::media::handler::delete_media),
        )
        .route("/api/admin/themes", get(modules::theme::handler::list_themes))
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
