use axum::{extract::{Query, State}, Json};
use serde::Deserialize;
use slug::slugify;
use std::sync::Arc;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::AdminUser,
    models::{ApiResponse, CreateTag, Tag, new_id},
    state::AppState,
};

#[derive(Deserialize)]
pub struct IdParam {
    pub id: String,
}

// GET /api/tags
pub async fn list_tags(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<Vec<Tag>>>> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT * FROM tags ORDER BY name ASC"
    )
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(ApiResponse::ok(tags)))
}

// POST /api/tags (仅管理员)
pub async fn create_tag(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Json(body): Json<CreateTag>,
) -> AppResult<Json<ApiResponse<Tag>>> {
    let id = new_id();
    let slug = body.slug
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| slugify(&body.name));

    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM tags WHERE slug = ? OR name = ?)"
    )
    .bind(&slug).bind(&body.name)
    .fetch_one(&state.pool)
    .await?;
    if exists {
        return Err(AppError::BadRequest("标签名或 slug 已存在".into()));
    }

    sqlx::query("INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)")
        .bind(&id).bind(&body.name).bind(&slug)
        .execute(&state.pool)
        .await?;

    let tag = sqlx::query_as::<_, Tag>("SELECT * FROM tags WHERE id = ?")
        .bind(&id).fetch_one(&state.pool).await?;
    Ok(Json(ApiResponse::ok(tag)))
}

// DELETE /api/tag/delete?id=xxx (仅管理员)
pub async fn delete_tag(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Query(params): Query<IdParam>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query("DELETE FROM tags WHERE id = ?")
        .bind(&params.id).execute(&state.pool).await?;
    Ok(Json(serde_json::json!({ "code": 0, "message": "删除成功" })))
}
