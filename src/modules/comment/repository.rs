use sqlx::SqlitePool;
use serde::Serialize;
use uuid::Uuid;

use super::domain::{AdminCommentItem, CommentItem};

/// 用于 WebSocket 事件广播的最小评论数据
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct CommentEventData {
    pub id: String,
    pub post_id: String,
    pub author_name: String,
    pub content: String,
    pub status: String,
    pub created_at: String,
}

pub async fn list_approved_for_post(pool: &SqlitePool, post_id: &str) -> Result<Vec<CommentItem>, sqlx::Error> {
    sqlx::query_as::<_, CommentItem>(
        "SELECT
            c.id,
            c.post_id,
            c.user_id,
            u.username,
            u.display_name,
            c.content,
            c.status,
            c.parent_id,
            c.created_at,
            c.updated_at
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.post_id = ? AND c.status = 'approved'
         ORDER BY c.created_at ASC",
    )
    .bind(post_id)
    .fetch_all(pool)
    .await
}

pub async fn list_by_user(
    pool: &SqlitePool,
    user_id: &str,
    limit: i64,
    offset: i64,
) -> Result<Vec<AdminCommentItem>, sqlx::Error> {
    sqlx::query_as::<_, AdminCommentItem>(
        "SELECT
            c.id,
            c.post_id,
            c.user_id,
            u.username,
            u.display_name,
            c.content,
            c.status,
            c.parent_id,
            c.created_at,
            c.updated_at,
            p.title AS post_title,
            p.slug AS post_slug
         FROM comments c
         JOIN users u ON u.id = c.user_id
         JOIN posts p ON p.id = c.post_id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?",
    )
    .bind(user_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
}

pub async fn count_by_user(pool: &SqlitePool, user_id: &str) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar("SELECT COUNT(*) FROM comments WHERE user_id = ?")
        .bind(user_id)
        .fetch_one(pool)
        .await
}

pub async fn count_approved_by_user(pool: &SqlitePool, user_id: &str) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar("SELECT COUNT(*) FROM comments WHERE user_id = ? AND status = 'approved'")
        .bind(user_id)
        .fetch_one(pool)
        .await
}

pub async fn insert_comment(
    pool: &SqlitePool,
    post_id: &str,
    user_id: &str,
    content: &str,
    parent_id: Option<&str>,
    status: &str,
) -> Result<(String, String), sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO comments (id, post_id, user_id, content, status, parent_id)
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(post_id)
    .bind(user_id)
    .bind(content)
    .bind(status)
    .bind(parent_id)
    .execute(pool)
    .await?;

    // 取回实际插入的 created_at（SQLite datetime('now') 格式）
    let created_at: String =
        sqlx::query_scalar("SELECT created_at FROM comments WHERE id = ?")
            .bind(&id)
            .fetch_one(pool)
            .await?;

    Ok((id, created_at))
}

pub async fn list_admin(
    pool: &SqlitePool,
    status: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<AdminCommentItem>, sqlx::Error> {
    if let Some(status) = status {
        sqlx::query_as::<_, AdminCommentItem>(
            "SELECT
                c.id,
                c.post_id,
                c.user_id,
                u.username,
                u.display_name,
                c.content,
                c.status,
                c.parent_id,
                c.created_at,
                c.updated_at,
                p.title AS post_title,
                p.slug AS post_slug
             FROM comments c
             JOIN users u ON u.id = c.user_id
             JOIN posts p ON p.id = c.post_id
             WHERE c.status = ?
             ORDER BY c.created_at DESC
             LIMIT ? OFFSET ?",
        )
        .bind(status)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query_as::<_, AdminCommentItem>(
            "SELECT
                c.id,
                c.post_id,
                c.user_id,
                u.username,
                u.display_name,
                c.content,
                c.status,
                c.parent_id,
                c.created_at,
                c.updated_at,
                p.title AS post_title,
                p.slug AS post_slug
             FROM comments c
             JOIN users u ON u.id = c.user_id
             JOIN posts p ON p.id = c.post_id
             ORDER BY c.created_at DESC
             LIMIT ? OFFSET ?",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}

pub async fn count_admin(pool: &SqlitePool, status: Option<&str>) -> Result<i64, sqlx::Error> {
    if let Some(status) = status {
        sqlx::query_scalar("SELECT COUNT(*) FROM comments WHERE status = ?")
            .bind(status)
            .fetch_one(pool)
            .await
    } else {
        sqlx::query_scalar("SELECT COUNT(*) FROM comments")
            .fetch_one(pool)
            .await
    }
}

pub async fn update_status(pool: &SqlitePool, id: &str, status: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE comments SET status = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(status)
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn soft_delete_owned(pool: &SqlitePool, id: &str, user_id: &str) -> Result<bool, sqlx::Error> {
    let result = sqlx::query(
        "UPDATE comments
         SET status = 'deleted', deleted_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ? AND user_id = ?",
    )
    .bind(id)
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn soft_delete_admin(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE comments
         SET status = 'deleted', deleted_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?",
    )
    .bind(id)
    .execute(pool)
    .await?;
    Ok(())
}

/// 查询单条评论用于 WS 事件广播（包含作者显示名）
pub async fn find_by_id_for_event(pool: &SqlitePool, id: &str) -> Result<Option<CommentEventData>, sqlx::Error> {
    sqlx::query_as::<_, CommentEventData>(
        "SELECT
            c.id,
            c.post_id,
            COALESCE(u.display_name, u.username) AS author_name,
            c.content,
            c.status,
            c.created_at
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}
