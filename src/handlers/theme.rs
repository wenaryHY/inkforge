use axum::{extract::{Query, State}, response::Html};
use serde::Serialize;
use sqlx::FromRow;
use std::sync::Arc;

use crate::{
    error::AppError,
    models::{Category, Post, PostWithMeta, Tag, UserPublic},
    state::AppState,
};

/// 批量为文章附加元数据
async fn attach_meta_batch(pool: &sqlx::SqlitePool, posts: Vec<Post>) -> Result<Vec<PostWithMeta>, AppError> {
    if posts.is_empty() {
        return Ok(vec![]);
    }

    let post_ids: Vec<&str> = posts.iter().map(|p| p.id.as_str()).collect();

    // 批量查询 authors
    let author_ids: Vec<&str> = posts.iter().map(|p| p.author_id.as_str()).collect();
    let placeholders = author_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
        "SELECT id, username, display_name, avatar, bio FROM users WHERE id IN ({})",
        placeholders
    );
    let mut q = sqlx::query_as::<_, UserPublic>(&query);
    for id in &author_ids { q = q.bind(*id); }
    let author_map: std::collections::HashMap<String, UserPublic> = q
        .fetch_all(pool).await.map_err(AppError::Database)?
        .into_iter().map(|u| (u.id.clone(), u)).collect();

    // 批量查询 categories
    let cat_ids: Vec<&str> = posts.iter()
        .filter_map(|p| p.category_id.as_deref())
        .collect();
    let category_map: std::collections::HashMap<String, Category> = if cat_ids.is_empty() {
        std::collections::HashMap::new()
    } else {
        let unique: Vec<&str> = cat_ids.into_iter()
            .collect::<std::collections::HashSet<_>>().into_iter().collect();
        let ph = unique.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let query = format!("SELECT * FROM categories WHERE id IN ({})", ph);
        let mut q = sqlx::query_as::<_, Category>(&query);
        for id in &unique { q = q.bind(*id); }
        q.fetch_all(pool).await.map_err(AppError::Database)?
            .into_iter().map(|c| (c.id.clone(), c)).collect()
    };

    // 批量查询 tags
    let ph = post_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
        "SELECT pt.post_id, t.id, t.name, t.slug, t.created_at \
         FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id IN ({})",
        ph
    );
    let mut q = sqlx::query_as::<_, (String, String, String, String, String)>(&query);
    for id in &post_ids { q = q.bind(*id); }
    let rows: Vec<(String, String, String, String, String)> =
        q.fetch_all(pool).await.map_err(AppError::Database)?;
    let mut tag_map: std::collections::HashMap<String, Vec<Tag>> = std::collections::HashMap::new();
    for (post_id, id, name, slug, created_at) in rows {
        tag_map.entry(post_id).or_default().push(Tag { id, name, slug, created_at });
    }

    // 组装
    let items: Vec<PostWithMeta> = posts.into_iter().map(|post| {
        let author = author_map.get(&post.author_id).cloned();
        let category = post.category_id.as_ref()
            .and_then(|cid| category_map.get(cid).cloned());
        let tags = tag_map.get(&post.id).cloned().unwrap_or_default();
        PostWithMeta { post, author, category, tags }
    }).collect();

    Ok(items)
}

pub async fn render_home(
    State(state): State<Arc<AppState>>,
) -> Result<Html<String>, AppError> {
    let per_page: i64 = get_setting(&state.pool, "posts_per_page")
        .await
        .unwrap_or_else(|_| "10".to_string())
        .parse()
        .unwrap_or(10)
        .max(1)
        .min(50);

    let posts: Vec<Post> = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE status='published' AND post_type='post'
         ORDER BY pinned DESC, published_at DESC, created_at DESC LIMIT ?"
    )
    .bind(per_page)
    .fetch_all(&state.pool)
    .await
    .map_err(AppError::Database)?;

    let items = attach_meta_batch(&state.pool, posts).await?;

    let site_title = get_setting(&state.pool, "site_title").await.unwrap_or_else(|_| "My Blog".into());
    let site_description = get_setting(&state.pool, "site_description").await.unwrap_or_default();

    let tmpl_str = std::fs::read_to_string("themes/default/templates/index.html")
        .unwrap_or_else(|_| {
            r#"<!DOCTYPE html><html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column">
            <h1 style="color:#e67e22">🦀 InkForge</h1>
            <p>Theme not found. <a href="/admin">Go to admin</a></p>
            </body></html>"#.to_string()
        });

    let mut env = minijinja::Environment::new();
    env.add_template("index", &tmpl_str)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("模板错误: {}", e)))?;
    let tmpl = env.get_template("index")
        .map_err(|e| AppError::Internal(anyhow::anyhow!("模板错误: {}", e)))?;

    let year = chrono::Utc::now().format("%Y").to_string();

    let html = tmpl.render(minijinja::context! {
        site_title => site_title.as_str(),
        site_description => site_description.as_str(),
        posts => serde_json::to_value(&items).unwrap_or(serde_json::json!([])),
        year => year.as_str(),
    })
    .map_err(|e| AppError::Internal(anyhow::anyhow!("渲染错误: {}", e)))?;

    Ok(Html(html))
}

pub async fn render_post(
    State(state): State<Arc<AppState>>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Html<String>, AppError> {
    let slug = params.get("slug")
        .ok_or_else(|| AppError::NotFound("缺少 slug 参数".into()))?
        .clone();
    let post: Option<Post> = sqlx::query_as(
        "SELECT * FROM posts WHERE (slug = ? OR id = ?) AND status = 'published'"
    )
    .bind(&slug).bind(&slug)
    .fetch_optional(&state.pool)
    .await
    .map_err(AppError::Database)?;

    let post = post.ok_or_else(|| AppError::NotFound("文章不存在".into()))?;

    // 更新浏览量
    sqlx::query("UPDATE posts SET views = views + 1 WHERE id = ?")
        .bind(&post.id)
        .execute(&state.pool)
        .await
        .map_err(AppError::Database)?;

    // 重新读取更新后的文章数据（views+1）
    let post: Post = sqlx::query_as(
        "SELECT * FROM posts WHERE id = ?"
    )
    .bind(&post.id)
    .fetch_one(&state.pool)
    .await
    .map_err(AppError::Database)?;

    let site_title = get_setting(&state.pool, "site_title").await.unwrap_or_else(|_| "My Blog".into());
    let allow_comment = get_setting(&state.pool, "allow_comment").await.unwrap_or_else(|_| "true".into());

    // 使用批量查询获取 meta
    let mut items = attach_meta_batch(&state.pool, vec![post.clone()]).await?;
    let full_post = items.pop().unwrap_or(PostWithMeta {
        post: post.clone(),
        author: None,
        category: None,
        tags: vec![],
    });

    // 查询已通过审核的评论
    #[derive(Debug, Serialize, FromRow)]
    struct CommentRow {
        author_name: String,
        content: String,
        created_at: String,
    }

    let comment_rows: Vec<CommentRow> = sqlx::query_as(
        "SELECT author_name, content, created_at FROM comments
         WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC"
    )
    .bind(&post.id)
    .fetch_all(&state.pool)
    .await
    .map_err(AppError::Database)?;

    let tmpl_str = std::fs::read_to_string("themes/default/templates/post.html")
        .unwrap_or_else(|_| {
            r#"<!DOCTYPE html><html><body style="font-family:system-ui;padding:2rem">
            <h1 style="color:#e67e22">🦀 InkForge</h1>
            <p>Post template not found.</p>
            </body></html>"#.to_string()
        });

    let mut env = minijinja::Environment::new();
    env.add_template("post", &tmpl_str)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("模板错误: {}", e)))?;
    let tmpl = env.get_template("post")
        .map_err(|e| AppError::Internal(anyhow::anyhow!("模板错误: {}", e)))?;

    let html = tmpl.render(minijinja::context! {
        site_title => site_title.as_str(),
        post => serde_json::to_value(&full_post).unwrap_or(serde_json::Value::Null),
        allow_comment => allow_comment == "true",
        comments => serde_json::to_value(&comment_rows).unwrap_or(serde_json::json!([])),
    })
    .map_err(|e| AppError::Internal(anyhow::anyhow!("渲染错误: {}", e)))?;

    Ok(Html(html))
}

async fn get_setting(pool: &sqlx::SqlitePool, key: &str) -> Result<String, AppError> {
    let val: Option<String> = sqlx::query_scalar(
        "SELECT value FROM settings WHERE key = ?"
    )
    .bind(key)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)?;
    Ok(val.unwrap_or_default())
}
