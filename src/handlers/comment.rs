use axum::{
    extract::{Query, State},
    Json,
};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::Arc;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::AdminUser,
    models::{ApiResponse, Comment, CreateComment, PageResult, new_id},
    state::AppState,
    ws::ServerEvent,
};

// ═══════════════════════════════════════════════════════════════════
// 公开 API
// ═══════════════════════════════════════════════════════════════════

// GET /api/comments?post_id=xxx
// 无 post_id 时只返回 approved 评论（公开首页用）
// 有 post_id 时也只返回 approved 评论（前台文章页用）
pub async fn list_comments(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
) -> AppResult<Json<ApiResponse<PageResult<Comment>>>> {
    let page = params.get("page").and_then(|v| v.parse().ok()).unwrap_or(1).max(1);
    let size = params.get("size").and_then(|v| v.parse().ok()).unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * size;
    let post_id = params.get("post_id");

    // 公开 API：始终只返回 approved 的评论
    let total: i64 = if let Some(pid) = post_id {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM comments WHERE post_id = ? AND status = 'approved'"
        )
        .bind(pid)
        .fetch_one(&state.pool)
        .await?
    } else {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM comments WHERE status = 'approved'"
        )
        .fetch_one(&state.pool)
        .await?
    };

    let comments: Vec<Comment> = if let Some(pid) = post_id {
        sqlx::query_as::<_, Comment>(
            "SELECT * FROM comments WHERE post_id = ? AND status = 'approved'
             ORDER BY created_at ASC LIMIT ? OFFSET ?"
        )
        .bind(pid).bind(size).bind(offset)
        .fetch_all(&state.pool).await?
    } else {
        sqlx::query_as::<_, Comment>(
            "SELECT * FROM comments WHERE status = 'approved'
             ORDER BY created_at DESC LIMIT ? OFFSET ?"
        )
        .bind(size).bind(offset)
        .fetch_all(&state.pool).await?
    };

    Ok(Json(ApiResponse::ok(PageResult::new(comments, total, page, size))))
}

// POST /api/comments（提交评论 — 默认 status='pending' 需管理员审核）
pub async fn create_comment(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateComment>,
) -> AppResult<Json<ApiResponse<Comment>>> {
    // 1. 检查全局 allow_comment 设置
    let allow: String = sqlx::query_scalar("SELECT value FROM settings WHERE key = 'allow_comment'")
        .fetch_one(&state.pool)
        .await
        .unwrap_or_else(|_| "true".to_string());
    if allow != "true" {
        return Err(AppError::BadRequest("评论功能已关闭".into()));
    }

    // 2. 验证文章存在且已发布
    let post_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM posts WHERE id = ? AND status = 'published')"
    )
    .bind(&body.post_id)
    .fetch_one(&state.pool)
    .await?;

    if !post_exists {
        return Err(AppError::BadRequest("文章不存在或未发布".into()));
    }

    // 3. 检查文章级 allow_comment
    let post_allow: bool = sqlx::query_scalar(
        "SELECT allow_comment FROM posts WHERE id = ?"
    )
    .bind(&body.post_id)
    .fetch_one(&state.pool)
    .await?;

    if !post_allow {
        return Err(AppError::BadRequest("该文章已关闭评论".into()));
    }

    let id = new_id();

    sqlx::query(
        "INSERT INTO comments (id, post_id, author_name, author_email, author_url, content, parent_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id).bind(&body.post_id).bind(&body.author_name)
    .bind(&body.author_email).bind(&body.author_url).bind(&body.content)
    .bind(&body.parent_id)
    .execute(&state.pool).await?;

    let comment = sqlx::query_as::<_, Comment>(
        "SELECT * FROM comments WHERE id = ?"
    )
    .bind(&id).fetch_one(&state.pool).await?;

    // 广播新评论事件
    let _ = state.event_tx.send(ServerEvent::CommentCreated {
        id: comment.id.clone(),
        post_id: comment.post_id.clone(),
        author_name: comment.author_name.clone(),
        content: comment.content.clone(),
        status: comment.status.clone(),
        created_at: comment.created_at.clone(),
    });

    Ok(Json(ApiResponse::ok(comment)))
}

// ═══════════════════════════════════════════════════════════════════
// 管理 API（需管理员）
// ═══════════════════════════════════════════════════════════════════

/// 带文章标题的评论（管理后台使用）
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct CommentWithPost {
    pub id: String,
    pub post_id: String,
    pub author_name: String,
    pub author_email: String,
    pub author_url: Option<String>,
    pub content: String,
    pub status: String,
    pub parent_id: Option<String>,
    pub created_at: String,
    pub post_title: Option<String>,
    pub post_slug: Option<String>,
}

// GET /api/admin/comments（管理后台 — 返回所有状态的评论 + 文章标题）
pub async fn admin_list_comments(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Query(params): Query<HashMap<String, String>>,
) -> AppResult<Json<ApiResponse<PageResult<CommentWithPost>>>> {
    let page = params.get("page").and_then(|v| v.parse().ok()).unwrap_or(1).max(1);
    let size = params.get("size").and_then(|v| v.parse().ok()).unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * size;

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM comments")
        .fetch_one(&state.pool).await?;

    let comments: Vec<CommentWithPost> = sqlx::query_as(
        "SELECT c.*, p.title AS post_title, p.slug AS post_slug
         FROM comments c
         LEFT JOIN posts p ON c.post_id = p.id
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?"
    )
    .bind(size).bind(offset)
    .fetch_all(&state.pool).await?;

    Ok(Json(ApiResponse::ok(PageResult::new(comments, total, page, size))))
}

#[derive(serde::Deserialize)]
pub struct IdParam {
    pub id: String,
}

// PUT /api/comment/approve?id=xxx（仅管理员 — 审核通过评论）
pub async fn approve_comment(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Query(params): Query<IdParam>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query("UPDATE comments SET status = 'approved' WHERE id = ?")
        .bind(&params.id).execute(&state.pool).await?;

    // 查询评论详情用于广播
    if let Ok(comment) = sqlx::query_as::<_, Comment>(
        "SELECT * FROM comments WHERE id = ?"
    )
    .bind(&params.id).fetch_optional(&state.pool).await
    {
        if let Some(c) = comment {
            let _ = state.event_tx.send(ServerEvent::CommentApproved {
                id: c.id,
                post_id: c.post_id,
                author_name: c.author_name,
                content: c.content,
                created_at: c.created_at,
            });
        }
    }

    Ok(Json(serde_json::json!({ "code": 0, "message": "审核通过" })))
}

// DELETE /api/comment/delete?id=xxx（仅管理员 — 删除评论）
pub async fn delete_comment(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Query(params): Query<IdParam>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query("DELETE FROM comments WHERE id = ?").bind(&params.id)
        .execute(&state.pool).await?;

    // 广播删除事件
    let _ = state.event_tx.send(ServerEvent::CommentDeleted {
        id: params.id.clone(),
    });

    Ok(Json(serde_json::json!({ "code": 0, "message": "删除成功" })))
}
