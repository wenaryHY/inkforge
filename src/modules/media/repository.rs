use sqlx::SqlitePool;
use uuid::Uuid;

use super::domain::MediaItem;

pub async fn list_media(
    pool: &SqlitePool,
    kind: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<MediaItem>, sqlx::Error> {
    if let Some(kind) = kind {
        sqlx::query_as::<_, MediaItem>(
            "SELECT * FROM media WHERE kind = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        )
        .bind(kind)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query_as::<_, MediaItem>(
            "SELECT * FROM media ORDER BY created_at DESC LIMIT ? OFFSET ?",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}

pub async fn count_media(pool: &SqlitePool, kind: Option<&str>) -> Result<i64, sqlx::Error> {
    if let Some(kind) = kind {
        sqlx::query_scalar("SELECT COUNT(*) FROM media WHERE kind = ?")
            .bind(kind)
            .fetch_one(pool)
            .await
    } else {
        sqlx::query_scalar("SELECT COUNT(*) FROM media")
            .fetch_one(pool)
            .await
    }
}

pub async fn insert_media(
    pool: &SqlitePool,
    uploader_id: &str,
    kind: &str,
    mime_type: &str,
    original_name: &str,
    stored_name: &str,
    storage_path: &str,
    public_url: &str,
    size_bytes: i64,
) -> Result<String, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO media (
            id, uploader_id, kind, mime_type, original_name, stored_name, storage_path, public_url, size_bytes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(uploader_id)
    .bind(kind)
    .bind(mime_type)
    .bind(original_name)
    .bind(stored_name)
    .bind(storage_path)
    .bind(public_url)
    .bind(size_bytes)
    .execute(pool)
    .await?;
    Ok(id)
}

pub async fn get_media(pool: &SqlitePool, id: &str) -> Result<Option<MediaItem>, sqlx::Error> {
    sqlx::query_as::<_, MediaItem>("SELECT * FROM media WHERE id = ? LIMIT 1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

pub async fn delete_media(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM media WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}
