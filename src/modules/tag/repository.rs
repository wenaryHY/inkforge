use sqlx::SqlitePool;
use uuid::Uuid;

use super::domain::Tag;

pub async fn list_tags(pool: &SqlitePool) -> Result<Vec<Tag>, sqlx::Error> {
    sqlx::query_as::<_, Tag>("SELECT * FROM tags ORDER BY name ASC")
        .fetch_all(pool)
        .await
}

pub async fn get_tag(pool: &SqlitePool, id: &str) -> Result<Option<Tag>, sqlx::Error> {
    sqlx::query_as::<_, Tag>("SELECT * FROM tags WHERE id = ? LIMIT 1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

pub async fn tag_slug_or_name_exists(
    pool: &SqlitePool,
    slug: &str,
    name: &str,
    exclude_id: Option<&str>,
) -> Result<bool, sqlx::Error> {
    if let Some(id) = exclude_id {
        sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM tags WHERE (slug = ? OR name = ?) AND id != ?)",
        )
        .bind(slug)
        .bind(name)
        .bind(id)
        .fetch_one(pool)
        .await
    } else {
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM tags WHERE slug = ? OR name = ?)")
            .bind(slug)
            .bind(name)
            .fetch_one(pool)
            .await
    }
}

pub async fn insert_tag(pool: &SqlitePool, name: &str, slug: &str) -> Result<String, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)")
        .bind(&id)
        .bind(name)
        .bind(slug)
        .execute(pool)
        .await?;
    Ok(id)
}

pub async fn update_tag(
    pool: &SqlitePool,
    id: &str,
    name: Option<&str>,
    slug: Option<&str>,
) -> Result<(), sqlx::Error> {
    if let Some(name) = name {
        if let Some(slug) = slug {
            sqlx::query("UPDATE tags SET name = ?, slug = ? WHERE id = ?")
                .bind(name)
                .bind(slug)
                .bind(id)
                .execute(pool)
                .await?;
        } else {
            sqlx::query("UPDATE tags SET name = ? WHERE id = ?")
                .bind(name)
                .bind(id)
                .execute(pool)
                .await?;
        }
    } else if let Some(slug) = slug {
        sqlx::query("UPDATE tags SET slug = ? WHERE id = ?")
            .bind(slug)
            .bind(id)
            .execute(pool)
            .await?;
    }
    Ok(())
}

pub async fn delete_tag(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM tags WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

#[allow(dead_code)]
pub async fn list_post_tags(pool: &SqlitePool, post_id: &str) -> Result<Vec<Tag>, sqlx::Error> {
    sqlx::query_as::<_, Tag>(
        "SELECT t.*
         FROM tags t
         JOIN post_tags pt ON pt.tag_id = t.id
         WHERE pt.post_id = ?
         ORDER BY t.name ASC",
    )
    .bind(post_id)
    .fetch_all(pool)
    .await
}

#[allow(dead_code)]
pub async fn replace_post_tags(pool: &SqlitePool, post_id: &str, tag_ids: &[String]) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM post_tags WHERE post_id = ?")
        .bind(post_id)
        .execute(pool)
        .await?;

    for tag_id in tag_ids {
        sqlx::query("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)")
            .bind(post_id)
            .bind(tag_id)
            .execute(pool)
            .await?;
    }

    Ok(())
}
