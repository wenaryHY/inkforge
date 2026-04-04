use sqlx::SqlitePool;

use crate::modules::setting::dto::SettingItem;

pub async fn list(pool: &SqlitePool) -> Result<Vec<SettingItem>, sqlx::Error> {
    sqlx::query_as::<_, (String, String)>("SELECT key, value FROM settings ORDER BY key ASC")
        .fetch_all(pool)
        .await
        .map(|rows| {
            rows.into_iter()
                .map(|(key, value)| SettingItem { key, value })
                .collect()
        })
}

pub async fn get_string(pool: &SqlitePool, key: &str, default: &str) -> Result<String, sqlx::Error> {
    Ok(sqlx::query_scalar::<_, String>("SELECT value FROM settings WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await?
        .unwrap_or_else(|| default.to_string()))
}

pub async fn get_bool(pool: &SqlitePool, key: &str, default: bool) -> Result<bool, sqlx::Error> {
    let default_str = if default { "true" } else { "false" };
    let value = get_string(pool, key, default_str).await?;
    Ok(value == "true")
}

pub async fn upsert(pool: &SqlitePool, key: &str, value: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
    )
    .bind(key)
    .bind(value)
    .execute(pool)
    .await?;
    Ok(())
}
