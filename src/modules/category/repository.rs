use sqlx::SqlitePool;
use uuid::Uuid;

use super::domain::Category;

pub async fn list_categories(pool: &SqlitePool) -> Result<Vec<Category>, sqlx::Error> {
    sqlx::query_as::<_, Category>("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
        .fetch_all(pool)
        .await
}

pub async fn get_category(pool: &SqlitePool, id: &str) -> Result<Option<Category>, sqlx::Error> {
    sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ? LIMIT 1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

pub async fn category_slug_or_name_exists(
    pool: &SqlitePool,
    slug: &str,
    name: &str,
    exclude_id: Option<&str>,
) -> Result<bool, sqlx::Error> {
    if let Some(exclude_id) = exclude_id {
        sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM categories WHERE (slug = ? OR name = ?) AND id != ?)",
        )
        .bind(slug)
        .bind(name)
        .bind(exclude_id)
        .fetch_one(pool)
        .await
    } else {
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM categories WHERE slug = ? OR name = ?)")
            .bind(slug)
            .bind(name)
            .fetch_one(pool)
            .await
    }
}

pub async fn insert_category(
    pool: &SqlitePool,
    name: &str,
    slug: &str,
    description: Option<&str>,
    parent_id: Option<&str>,
    sort_order: i64,
) -> Result<String, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(name)
    .bind(slug)
    .bind(description)
    .bind(parent_id)
    .bind(sort_order)
    .execute(pool)
    .await?;
    Ok(id)
}

pub async fn update_category(
    pool: &SqlitePool,
    id: &str,
    name: &str,
    slug: &str,
    description: Option<&str>,
    parent_id: Option<&str>,
    sort_order: i64,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE categories
         SET name = ?, slug = ?, description = ?, parent_id = ?, sort_order = ?
         WHERE id = ?",
    )
    .bind(name)
    .bind(slug)
    .bind(description)
    .bind(parent_id)
    .bind(sort_order)
    .bind(id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn delete_category(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE posts SET category_id = NULL WHERE category_id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    sqlx::query("DELETE FROM categories WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}
