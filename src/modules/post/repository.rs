use sqlx::SqlitePool;
use uuid::Uuid;

use super::domain::{AdminPost, Category, CommentTargetPost, PublicPostDetail, PublicPostSummary, Tag};

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
    if let Some(exclude_id) = exclude_id {
        sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM tags WHERE (slug = ? OR name = ?) AND id != ?)",
        )
        .bind(slug)
        .bind(name)
        .bind(exclude_id)
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

pub async fn delete_tag(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM tags WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn list_recent_public_posts(pool: &SqlitePool, limit: i64) -> Result<Vec<PublicPostSummary>, sqlx::Error> {
    sqlx::query_as::<_, PublicPostSummary>(
        "SELECT
            p.id,
            p.title,
            p.slug,
            p.excerpt,
            p.published_at,
            p.created_at,
            p.updated_at,
            u.display_name AS author_display_name,
            c.name AS category_name
         FROM posts p
         JOIN users u ON u.id = p.author_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.status = 'published' AND p.visibility = 'public'
         ORDER BY p.pinned DESC, p.published_at DESC, p.created_at DESC
         LIMIT ?",
    )
    .bind(limit)
    .fetch_all(pool)
    .await
}

pub async fn list_public_posts(
    pool: &SqlitePool,
    keyword: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<PublicPostSummary>, sqlx::Error> {
    if let Some(keyword) = keyword {
        let like = format!("%{}%", keyword);
        sqlx::query_as::<_, PublicPostSummary>(
            "SELECT
                p.id,
                p.title,
                p.slug,
                p.excerpt,
                p.published_at,
                p.created_at,
                p.updated_at,
                u.display_name AS author_display_name,
                c.name AS category_name
             FROM posts p
             JOIN users u ON u.id = p.author_id
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.status = 'published' AND p.visibility = 'public'
               AND (p.title LIKE ? OR p.excerpt LIKE ? OR p.content_md LIKE ?)
             ORDER BY p.pinned DESC, p.published_at DESC, p.created_at DESC
             LIMIT ? OFFSET ?",
        )
        .bind(&like)
        .bind(&like)
        .bind(&like)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query_as::<_, PublicPostSummary>(
            "SELECT
                p.id,
                p.title,
                p.slug,
                p.excerpt,
                p.published_at,
                p.created_at,
                p.updated_at,
                u.display_name AS author_display_name,
                c.name AS category_name
             FROM posts p
             JOIN users u ON u.id = p.author_id
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.status = 'published' AND p.visibility = 'public'
             ORDER BY p.pinned DESC, p.published_at DESC, p.created_at DESC
             LIMIT ? OFFSET ?",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}

pub async fn count_public_posts(pool: &SqlitePool, keyword: Option<&str>) -> Result<i64, sqlx::Error> {
    if let Some(keyword) = keyword {
        let like = format!("%{}%", keyword);
        sqlx::query_scalar(
            "SELECT COUNT(*)
             FROM posts
             WHERE status = 'published' AND visibility = 'public'
               AND (title LIKE ? OR excerpt LIKE ? OR content_md LIKE ?)",
        )
        .bind(&like)
        .bind(&like)
        .bind(&like)
        .fetch_one(pool)
        .await
    } else {
        sqlx::query_scalar("SELECT COUNT(*) FROM posts WHERE status = 'published' AND visibility = 'public'")
            .fetch_one(pool)
            .await
    }
}

pub async fn get_public_post_by_slug(pool: &SqlitePool, slug: &str) -> Result<Option<PublicPostDetail>, sqlx::Error> {
    sqlx::query_as::<_, PublicPostDetail>(
        "SELECT
            p.id,
            p.title,
            p.slug,
            p.excerpt,
            p.content_html,
            p.allow_comment,
            p.published_at,
            p.created_at,
            p.updated_at,
            u.display_name AS author_display_name,
            c.name AS category_name
         FROM posts p
         JOIN users u ON u.id = p.author_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.slug = ? AND p.status = 'published' AND p.visibility = 'public'
         LIMIT 1",
    )
    .bind(slug)
    .fetch_optional(pool)
    .await
}

pub async fn find_comment_target(pool: &SqlitePool, slug: &str) -> Result<Option<CommentTargetPost>, sqlx::Error> {
    sqlx::query_as::<_, CommentTargetPost>(
        "SELECT id, status, visibility, allow_comment FROM posts WHERE slug = ? LIMIT 1",
    )
    .bind(slug)
    .fetch_optional(pool)
    .await
}

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

pub async fn list_admin_posts(
    pool: &SqlitePool,
    status: Option<&str>,
    keyword: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<AdminPost>, sqlx::Error> {
    match (status, keyword) {
        (Some(status), Some(keyword)) => {
            let like = format!("%{}%", keyword);
            sqlx::query_as::<_, AdminPost>(
                "SELECT * FROM posts
                 WHERE status = ? AND (title LIKE ? OR excerpt LIKE ? OR content_md LIKE ?)
                 ORDER BY pinned DESC, published_at DESC, created_at DESC
                 LIMIT ? OFFSET ?",
            )
            .bind(status)
            .bind(&like)
            .bind(&like)
            .bind(&like)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await
        }
        (Some(status), None) => {
            sqlx::query_as::<_, AdminPost>(
                "SELECT * FROM posts
                 WHERE status = ?
                 ORDER BY pinned DESC, published_at DESC, created_at DESC
                 LIMIT ? OFFSET ?",
            )
            .bind(status)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await
        }
        (None, Some(keyword)) => {
            let like = format!("%{}%", keyword);
            sqlx::query_as::<_, AdminPost>(
                "SELECT * FROM posts
                 WHERE title LIKE ? OR excerpt LIKE ? OR content_md LIKE ?
                 ORDER BY pinned DESC, published_at DESC, created_at DESC
                 LIMIT ? OFFSET ?",
            )
            .bind(&like)
            .bind(&like)
            .bind(&like)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await
        }
        (None, None) => {
            sqlx::query_as::<_, AdminPost>(
                "SELECT * FROM posts
                 ORDER BY pinned DESC, published_at DESC, created_at DESC
                 LIMIT ? OFFSET ?",
            )
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await
        }
    }
}

pub async fn count_admin_posts(
    pool: &SqlitePool,
    status: Option<&str>,
    keyword: Option<&str>,
) -> Result<i64, sqlx::Error> {
    match (status, keyword) {
        (Some(status), Some(keyword)) => {
            let like = format!("%{}%", keyword);
            sqlx::query_scalar(
                "SELECT COUNT(*) FROM posts WHERE status = ? AND (title LIKE ? OR excerpt LIKE ? OR content_md LIKE ?)",
            )
            .bind(status)
            .bind(&like)
            .bind(&like)
            .bind(&like)
            .fetch_one(pool)
            .await
        }
        (Some(status), None) => {
            sqlx::query_scalar("SELECT COUNT(*) FROM posts WHERE status = ?")
                .bind(status)
                .fetch_one(pool)
                .await
        }
        (None, Some(keyword)) => {
            let like = format!("%{}%", keyword);
            sqlx::query_scalar(
                "SELECT COUNT(*) FROM posts WHERE title LIKE ? OR excerpt LIKE ? OR content_md LIKE ?",
            )
            .bind(&like)
            .bind(&like)
            .bind(&like)
            .fetch_one(pool)
            .await
        }
        (None, None) => sqlx::query_scalar("SELECT COUNT(*) FROM posts").fetch_one(pool).await,
    }
}

pub async fn get_admin_post(pool: &SqlitePool, id: &str) -> Result<Option<AdminPost>, sqlx::Error> {
    sqlx::query_as::<_, AdminPost>("SELECT * FROM posts WHERE id = ? LIMIT 1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

pub async fn slug_exists(pool: &SqlitePool, slug: &str, exclude_id: Option<&str>) -> Result<bool, sqlx::Error> {
    if let Some(exclude_id) = exclude_id {
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM posts WHERE slug = ? AND id != ?)")
            .bind(slug)
            .bind(exclude_id)
            .fetch_one(pool)
            .await
    } else {
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM posts WHERE slug = ?)")
            .bind(slug)
            .fetch_one(pool)
            .await
    }
}

pub async fn insert_post(
    pool: &SqlitePool,
    author_id: &str,
    title: &str,
    slug: &str,
    excerpt: Option<&str>,
    content_md: &str,
    content_html: &str,
    cover_media_id: Option<&str>,
    status: &str,
    visibility: &str,
    category_id: Option<&str>,
    allow_comment: bool,
    pinned: bool,
) -> Result<String, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    let published_at = if status == "published" {
        Some(chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string())
    } else {
        None
    };

    sqlx::query(
        "INSERT INTO posts (
            id, author_id, title, slug, excerpt, content_md, content_html, cover_media_id,
            status, visibility, category_id, allow_comment, pinned, published_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(author_id)
    .bind(title)
    .bind(slug)
    .bind(excerpt)
    .bind(content_md)
    .bind(content_html)
    .bind(cover_media_id)
    .bind(status)
    .bind(visibility)
    .bind(category_id)
    .bind(if allow_comment { 1 } else { 0 })
    .bind(if pinned { 1 } else { 0 })
    .bind(published_at)
    .execute(pool)
    .await?;

    Ok(id)
}

pub async fn update_post(
    pool: &SqlitePool,
    id: &str,
    title: &str,
    slug: &str,
    excerpt: Option<&str>,
    content_md: &str,
    content_html: &str,
    cover_media_id: Option<&str>,
    status: &str,
    visibility: &str,
    category_id: Option<&str>,
    allow_comment: bool,
    pinned: bool,
) -> Result<(), sqlx::Error> {
    let published_at = if status == "published" {
        Some(chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string())
    } else {
        None
    };

    sqlx::query(
        "UPDATE posts
         SET title = ?, slug = ?, excerpt = ?, content_md = ?, content_html = ?, cover_media_id = ?,
             status = ?, visibility = ?, category_id = ?, allow_comment = ?, pinned = ?, published_at = ?,
             updated_at = datetime('now')
         WHERE id = ?",
    )
    .bind(title)
    .bind(slug)
    .bind(excerpt)
    .bind(content_md)
    .bind(content_html)
    .bind(cover_media_id)
    .bind(status)
    .bind(visibility)
    .bind(category_id)
    .bind(if allow_comment { 1 } else { 0 })
    .bind(if pinned { 1 } else { 0 })
    .bind(published_at)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn replace_tags(pool: &SqlitePool, post_id: &str, tag_ids: &[String]) -> Result<(), sqlx::Error> {
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

pub async fn delete_post(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM posts WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}
