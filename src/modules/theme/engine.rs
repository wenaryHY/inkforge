use minijinja::{Environment, Value};
use std::sync::Arc;

use super::repository;
use crate::shared::error::AppResult;
use crate::state::AppState;

/// Build a fresh MiniJinja Environment for the current request.
///
/// Strategy 1A: Dynamic template loader — reads templates from disk on every request.
/// Strategy 2B: Context Functions — exposes DB query functions to templates.
/// Strategy 3B: theme_assets_url helper — generates named static paths.
pub async fn build_template_engine(state: Arc<AppState>) -> AppResult<Environment<'static>> {
    let active_theme = repository::get_active_theme(&state.pool).await?;
    let template_dir = state.theme_dir.join(&active_theme).join("templates");

    let mut env = Environment::new();

    // ── 1A: Dynamic template loader ──────────────────────────────────
    let loader_path = template_dir.clone();
    env.set_loader(move |name| {
        let path = loader_path.join(name);
        match std::fs::read_to_string(path) {
            Ok(content) => Ok(Some(content)),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(e) => Err(minijinja::Error::new(
                minijinja::ErrorKind::TemplateNotFound,
                format!("IO error: {}", e),
            )),
        }
    });

    // ── Globals ──────────────────────────────────────────────────────
    let site_title =
        crate::modules::setting::repository::get_string(&state.pool, "site_title", "InkForge")
            .await
            .unwrap_or_else(|_| "InkForge".to_string());
    env.add_global("site_title", Value::from(site_title));

    let site_description =
        crate::modules::setting::repository::get_string(&state.pool, "site_description", "")
            .await
            .unwrap_or_default();
    env.add_global("site_description", Value::from(site_description));

    let site_url =
        crate::modules::setting::repository::get_string(&state.pool, "site_url", "")
            .await
            .unwrap_or_default();
    env.add_global("site_url", Value::from(site_url));

    let admin_url = crate::modules::setting::repository::get_string(
        &state.pool,
        "admin_url",
        "/admin",
    )
    .await
    .unwrap_or_else(|_| "/admin".to_string());
    env.add_global("admin_url", Value::from(admin_url));

    // Theme config (HashMap<String, serde_json::Value>)
    let theme_config = repository::get_config(&state.pool, &active_theme)
        .await
        .unwrap_or(None);
    if let Some(cfg) = theme_config {
        env.add_global("theme_config", Value::from_serialize(&cfg));
    }

    // ── 3B: theme_assets_url helper ──────────────────────────────────
    let slug = active_theme.clone();
    env.add_function(
        "theme_assets_url",
        move |path: String| -> Result<Value, minijinja::Error> {
            Ok(Value::from(format!("/static/themes/{}/{}", slug, path)))
        },
    );

    env.add_filter(
        "tojson",
        |value: Value| -> Result<String, minijinja::Error> {
            serde_json::to_string(&value)
                .map_err(|err| {
                    minijinja::Error::new(minijinja::ErrorKind::InvalidOperation, err.to_string())
                })
        },
    );

    // ── 2B: Context Functions ────────────────────────────────────────
    // get_recent_posts(limit=10)
    let pool_posts = state.pool.clone();
    env.add_function(
        "get_recent_posts",
        move |limit: Option<i64>| -> Result<Value, minijinja::Error> {
            let limit = limit.unwrap_or(10);
            let pool = pool_posts.clone();
            let result = tokio::task::block_in_place(move || {
                tokio::runtime::Handle::current().block_on(async move {
                    crate::modules::post::repository::list_recent_public_posts(&pool, limit).await
                })
            });
            match result {
                Ok(posts) => Ok(Value::from_serialize(&posts)),
                Err(e) => Err(minijinja::Error::new(
                    minijinja::ErrorKind::InvalidOperation,
                    format!("DB error: {}", e),
                )),
            }
        },
    );

    // get_tags()
    let pool_tags = state.pool.clone();
    env.add_function("get_tags", move || -> Result<Value, minijinja::Error> {
        let pool = pool_tags.clone();
        let result = tokio::task::block_in_place(move || {
            tokio::runtime::Handle::current()
                .block_on(async move { crate::modules::tag::repository::list_tags(&pool).await })
        });
        match result {
            Ok(tags) => Ok(Value::from_serialize(&tags)),
            Err(e) => Err(minijinja::Error::new(
                minijinja::ErrorKind::InvalidOperation,
                format!("DB error: {}", e),
            )),
        }
    });

    // get_categories()
    let pool_cats = state.pool.clone();
    env.add_function(
        "get_categories",
        move || -> Result<Value, minijinja::Error> {
            let pool = pool_cats.clone();
            let result = tokio::task::block_in_place(move || {
                tokio::runtime::Handle::current().block_on(async move {
                    crate::modules::category::repository::list_categories(&pool).await
                })
            });
            match result {
                Ok(cats) => Ok(Value::from_serialize(&cats)),
                Err(e) => Err(minijinja::Error::new(
                    minijinja::ErrorKind::InvalidOperation,
                    format!("DB error: {}", e),
                )),
            }
        },
    );

    Ok(env)
}
