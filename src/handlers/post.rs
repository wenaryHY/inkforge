use axum::{
    extract::{Query, State},
    Json,
};
use pulldown_cmark::{html, Options, Parser};
use serde::Deserialize;
use slug::slugify;
use std::sync::Arc;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::{AdminUser, AuthUser},
    models::{
        ApiResponse, Category, CreatePost, PageResult, Post, PostQuery, PostWithMeta,
        Tag, UpdatePost, UserPublic, new_id,
    },
    state::AppState,
};

fn md_to_html(md: &str) -> String {
    let mut opts = Options::empty();
    opts.insert(Options::ENABLE_TABLES);
    opts.insert(Options::ENABLE_STRIKETHROUGH);
    let parser = Parser::new_ext(md, opts);
    let mut html_out = String::new();
    html::push_html(&mut html_out, parser);
    html_out
}

/// 为单篇文章附加 author、category、tags 元数据
async fn attach_meta(pool: &sqlx::SqlitePool, post: Post) -> AppResult<PostWithMeta> {
    let author = sqlx::query_as::<_, UserPublic>(
        "SELECT id, username, display_name, avatar, bio FROM users WHERE id = ?"
    )
    .bind(&post.author_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)?;

    let category = if let Some(ref cid) = post.category_id {
        sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ?")
            .bind(cid)
            .fetch_optional(pool)
            .await
            .map_err(AppError::Database)?
    } else {
        None
    };

    let tags = sqlx::query_as::<_, Tag>(
        "SELECT t.* FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?"
    )
    .bind(&post.id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(PostWithMeta { post, author, category, tags })
}

/// 批量为多篇文章附加元数据（解决 N+1 查询问题）
async fn attach_meta_batch(pool: &sqlx::SqlitePool, posts: Vec<Post>) -> AppResult<Vec<PostWithMeta>> {
    if posts.is_empty() {
        return Ok(vec![]);
    }

    // 收集所有需要查询的 ID
    let author_ids: Vec<&str> = posts.iter().map(|p| p.author_id.as_str()).collect();
    let category_ids: Vec<&str> = posts.iter()
        .filter_map(|p| p.category_id.as_deref())
        .collect();
    let post_ids: Vec<&str> = posts.iter().map(|p| p.id.as_str()).collect();

    // 批量查询作者
    let author_map: std::collections::HashMap<String, UserPublic> = {
        let placeholders = author_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let query = format!(
            "SELECT id, username, display_name, avatar, bio FROM users WHERE id IN ({})",
            placeholders
        );
        let mut q = sqlx::query_as::<_, UserPublic>(&query);
        for id in &author_ids {
            q = q.bind(*id);
        }
        let rows: Vec<UserPublic> = q.fetch_all(pool).await.map_err(AppError::Database)?;
        rows.into_iter().map(|u| (u.id.clone(), u)).collect()
    };

    // 批量查询分类
    let category_map: std::collections::HashMap<String, Category> = {
        if category_ids.is_empty() {
            std::collections::HashMap::new()
        } else {
            let unique_ids: Vec<&str> = category_ids.into_iter()
                .collect::<std::collections::HashSet<_>>()
                .into_iter()
                .collect();
            let placeholders = unique_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let query = format!("SELECT * FROM categories WHERE id IN ({})", placeholders);
            let mut q = sqlx::query_as::<_, Category>(&query);
            for id in &unique_ids {
                q = q.bind(*id);
            }
            let rows: Vec<Category> = q.fetch_all(pool).await.map_err(AppError::Database)?;
            rows.into_iter().map(|c| (c.id.clone(), c)).collect()
        }
    };

    // 批量查询标签
    let tag_map: std::collections::HashMap<String, Vec<Tag>> = {
        if post_ids.is_empty() {
            std::collections::HashMap::new()
        } else {
            let placeholders = post_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let query = format!(
                "SELECT pt.post_id, t.id, t.name, t.slug, t.created_at \
                 FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id IN ({})",
                placeholders
            );
            let mut q = sqlx::query_as::<_, (String, String, String, String, String)>(&query);
            for id in &post_ids {
                q = q.bind(*id);
            }
            let rows: Vec<(String, String, String, String, String)> =
                q.fetch_all(pool).await.map_err(AppError::Database)?;
            let mut map: std::collections::HashMap<String, Vec<Tag>> = std::collections::HashMap::new();
            for (post_id, id, name, slug, created_at) in rows {
                map.entry(post_id).or_default().push(Tag {
                    id, name, slug, created_at,
                });
            }
            map
        }
    };

    // 组装结果
    let items: Vec<PostWithMeta> = posts.into_iter().map(|post| {
        let author = author_map.get(&post.author_id).cloned();
        let category = post.category_id.as_ref()
            .and_then(|cid| category_map.get(cid).cloned());
        let tags = tag_map.get(&post.id).cloned().unwrap_or_default();
        PostWithMeta { post, author, category, tags }
    }).collect();

    Ok(items)
}

// ═══════════════════════════════════════════════════════════════════
// 公开 API
// ═══════════════════════════════════════════════════════════════════

// GET /api/posts（公开 — 强制只返回已发布文章）
pub async fn list_posts(
    State(state): State<Arc<AppState>>,
    Query(q): Query<PostQuery>,
) -> AppResult<Json<ApiResponse<PageResult<PostWithMeta>>>> {
    let page = q.page.unwrap_or(1).max(1);
    let size = q.size.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * size;

    // 注意：公开 API 忽略 status 参数，始终只返回 published
    let post_type = q.post_type.as_deref().unwrap_or("post");

    let posts: Vec<Post> = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE status = 'published' AND post_type = ?
         ORDER BY pinned DESC, published_at DESC, created_at DESC
         LIMIT ? OFFSET ?"
    )
    .bind(post_type)
    .bind(size)
    .bind(offset)
    .fetch_all(&state.pool)
    .await
    .map_err(AppError::Database)?;

    let total: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM posts WHERE status = 'published' AND post_type = ?"
    )
    .bind(post_type)
    .fetch_one(&state.pool)
    .await
    .map_err(AppError::Database)?;

    let items = attach_meta_batch(&state.pool, posts).await?;

    Ok(Json(ApiResponse::ok(PageResult::new(items, total, page, size))))
}

// ═══════════════════════════════════════════════════════════════════
// 认证 API（需登录）
// ═══════════════════════════════════════════════════════════════════

// POST /api/posts（创建文章）
pub async fn create_post(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(body): Json<CreatePost>,
) -> AppResult<Json<ApiResponse<Post>>> {
    let id = new_id();
    let slug = body.slug
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| slugify(&body.title));

    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM posts WHERE slug = ?)")
        .bind(&slug)
        .fetch_one(&state.pool)
        .await
        .map_err(AppError::Database)?;
    if exists {
        return Err(AppError::BadRequest(format!("slug '{}' 已被使用", slug)));
    }

    let content_html = md_to_html(&body.content);
    let status = body.status.as_deref().unwrap_or("draft");
    let post_type = body.post_type.as_deref().unwrap_or("post");
    let allow_comment = body.allow_comment.unwrap_or(true) as i64;
    let pinned = body.pinned.unwrap_or(false) as i64;
    let published_at = if status == "published" {
        Some(chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string())
    } else {
        None
    };

    sqlx::query(
        "INSERT INTO posts (id, title, slug, excerpt, content, content_html, cover,
         status, post_type, author_id, category_id, allow_comment, pinned, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id).bind(&body.title).bind(&slug).bind(&body.excerpt)
    .bind(&body.content).bind(&content_html).bind(&body.cover)
    .bind(status).bind(post_type).bind(&auth.0.sub).bind(&body.category_id)
    .bind(allow_comment).bind(pinned).bind(&published_at)
    .execute(&state.pool)
    .await
    .map_err(AppError::Database)?;

    if let Some(tag_ids) = body.tag_ids {
        for tag_id in tag_ids {
            sqlx::query("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)")
                .bind(&id).bind(&tag_id)
                .execute(&state.pool).await
                .map_err(AppError::Database)?;
        }
    }

    let post = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.pool)
        .await
        .map_err(AppError::Database)?;

    Ok(Json(ApiResponse::ok(post)))
}

#[derive(Deserialize)]
pub struct IdParam {
    pub id: String,
}

// PUT /api/post/update?id=xxx（更新文章 — 作者本人或管理员）
pub async fn update_post(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Query(params): Query<IdParam>,
    Json(body): Json<UpdatePost>,
) -> AppResult<Json<ApiResponse<Post>>> {
    let id = &params.id;
    let post = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE id = ?")
        .bind(id)
        .fetch_optional(&state.pool)
        .await
        .map_err(AppError::Database)?
        .ok_or_else(|| AppError::NotFound("文章不存在".into()))?;

    if auth.0.role != "admin" && post.author_id != auth.0.sub {
        return Err(AppError::Forbidden);
    }

    let title = body.title.as_deref().unwrap_or(&post.title).to_string();
    let slug = body.slug.as_deref().unwrap_or(&post.slug).to_string();
    let content = body.content.as_deref().unwrap_or(&post.content).to_string();
    let content_html = if body.content.is_some() { md_to_html(&content) } else { post.content_html.clone() };
    let status = body.status.as_deref().unwrap_or(&post.status).to_string();
    let category_id = body.category_id.or(post.category_id);
    let allow_comment = body.allow_comment.map(|v| v as i64).unwrap_or(post.allow_comment);
    let pinned = body.pinned.map(|v| v as i64).unwrap_or(post.pinned);
    let cover = body.cover.or(post.cover);
    let excerpt = body.excerpt.or(post.excerpt);
    let published_at = if status == "published" && post.published_at.is_none() {
        Some(chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string())
    } else {
        post.published_at
    };

    sqlx::query(
        "UPDATE posts SET title=?, slug=?, excerpt=?, content=?, content_html=?,
         cover=?, status=?, category_id=?, allow_comment=?, pinned=?,
         published_at=?, updated_at=datetime('now') WHERE id=?"
    )
    .bind(&title).bind(&slug).bind(&excerpt).bind(&content).bind(&content_html)
    .bind(&cover).bind(&status).bind(&category_id)
    .bind(allow_comment).bind(pinned).bind(&published_at).bind(id)
    .execute(&state.pool)
    .await
    .map_err(AppError::Database)?;

    if let Some(tag_ids) = body.tag_ids {
        sqlx::query("DELETE FROM post_tags WHERE post_id = ?").bind(id)
            .execute(&state.pool).await.map_err(AppError::Database)?;
        for tag_id in tag_ids {
            sqlx::query("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)")
                .bind(id).bind(&tag_id)
                .execute(&state.pool).await.map_err(AppError::Database)?;
        }
    }

    let updated = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE id = ?")
        .bind(id).fetch_one(&state.pool).await.map_err(AppError::Database)?;

    Ok(Json(ApiResponse::ok(updated)))
}

// DELETE /api/post/delete?id=xxx（删除文章 — 作者本人或管理员）
// 级联删除：post_tags + comments 会被 ON DELETE CASCADE 自动处理（schema 中已定义）
pub async fn delete_post(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Query(params): Query<IdParam>,
) -> AppResult<Json<serde_json::Value>> {
    let id = &params.id;
    let post = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE id = ?")
        .bind(id)
        .fetch_optional(&state.pool)
        .await
        .map_err(AppError::Database)?
        .ok_or_else(|| AppError::NotFound("文章不存在".into()))?;

    if auth.0.role != "admin" && post.author_id != auth.0.sub {
        return Err(AppError::Forbidden);
    }

    // 显式删除关联数据（确保即使外键约束未生效也能清理）
    sqlx::query("DELETE FROM post_tags WHERE post_id = ?")
        .bind(id).execute(&state.pool).await.map_err(AppError::Database)?;
    sqlx::query("DELETE FROM comments WHERE post_id = ?")
        .bind(id).execute(&state.pool).await.map_err(AppError::Database)?;
    sqlx::query("DELETE FROM posts WHERE id = ?")
        .bind(id).execute(&state.pool).await.map_err(AppError::Database)?;

    Ok(Json(serde_json::json!({ "code": 0, "message": "删除成功" })))
}

// ═══════════════════════════════════════════════════════════════════
// 管理 API（需管理员）
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/posts（管理后台 — 可查询所有状态的文章）
pub async fn admin_list_posts(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Query(q): Query<PostQuery>,
) -> AppResult<Json<ApiResponse<PageResult<PostWithMeta>>>> {
    let page = q.page.unwrap_or(1).max(1);
    let size = q.size.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * size;
    let post_type = q.post_type.as_deref().unwrap_or("post");

    let posts: Vec<Post> = if let Some(ref status) = q.status {
        sqlx::query_as::<_, Post>(
            "SELECT * FROM posts WHERE status = ? AND post_type = ?
             ORDER BY pinned DESC, published_at DESC, created_at DESC
             LIMIT ? OFFSET ?"
        )
        .bind(status).bind(post_type).bind(size).bind(offset)
        .fetch_all(&state.pool).await.map_err(AppError::Database)?
    } else {
        sqlx::query_as::<_, Post>(
            "SELECT * FROM posts WHERE post_type = ?
             ORDER BY pinned DESC, published_at DESC, created_at DESC
             LIMIT ? OFFSET ?"
        )
        .bind(post_type).bind(size).bind(offset)
        .fetch_all(&state.pool).await.map_err(AppError::Database)?
    };

    let total: i64 = if let Some(ref status) = q.status {
        sqlx::query_scalar(
            "SELECT COUNT(*) FROM posts WHERE status = ? AND post_type = ?"
        )
        .bind(status).bind(post_type)
        .fetch_one(&state.pool).await.map_err(AppError::Database)?
    } else {
        sqlx::query_scalar(
            "SELECT COUNT(*) FROM posts WHERE post_type = ?"
        )
        .bind(post_type)
        .fetch_one(&state.pool).await.map_err(AppError::Database)?
    };

    let items = attach_meta_batch(&state.pool, posts).await?;

    Ok(Json(ApiResponse::ok(PageResult::new(items, total, page, size))))
}
