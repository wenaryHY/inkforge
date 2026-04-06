use sqlx::SqlitePool;
use uuid::Uuid;
use crate::modules::theme::ThemeConfig;
use crate::shared::error::AppResult;

pub async fn save_config(
    pool: &SqlitePool,
    theme_slug: &str,
    config: &ThemeConfig,
) -> AppResult<()> {
    let id = Uuid::new_v4().to_string();
    let config_json = serde_json::to_string(config)?;
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT OR REPLACE INTO theme_configs (id, theme_slug, config_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(theme_slug)
    .bind(&config_json)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_config(pool: &SqlitePool, theme_slug: &str) -> AppResult<Option<ThemeConfig>> {
    let record = sqlx::query_as::<_, (String,)>(
        "SELECT config_json FROM theme_configs WHERE theme_slug = ? LIMIT 1"
    )
    .bind(theme_slug)
    .fetch_optional(pool)
    .await?;

    Ok(record.and_then(|(json_str,)| {
        serde_json::from_str(&json_str).ok()
    }))
}

pub async fn set_active_theme(pool: &SqlitePool, theme_slug: &str) -> AppResult<()> {
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)"
    )
    .bind("active_theme")
    .bind(theme_slug)
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_active_theme(pool: &SqlitePool) -> AppResult<String> {
    let result = sqlx::query_as::<_, (String,)>(
        "SELECT value FROM settings WHERE key = 'active_theme' LIMIT 1"
    )
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|(v,)| v).unwrap_or_else(|| "default".to_string()))
}

pub async fn config_exists(pool: &SqlitePool, theme_slug: &str) -> AppResult<bool> {
    let result = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM theme_configs WHERE theme_slug = ? LIMIT 1"
    )
    .bind(theme_slug)
    .fetch_one(pool)
    .await?;

    Ok(result > 0)
}
