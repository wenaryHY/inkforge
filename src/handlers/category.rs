use axum::{extract::{Query, State}, Json};
use serde::Deserialize;
use slug::slugify;
use std::sync::Arc;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::AdminUser,
    models::{ApiResponse, Category, CreateCategory, UpdateCategory, new_id},
    state::AppState,
};

#[derive(Deserialize)]
pub struct IdParam {
    pub id: String,
}

// GET /api/categories
pub async fn list_categories(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<Vec<Category>>>> {
    let cats = sqlx::query_as::<_, Category>(
        "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
    )
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(ApiResponse::ok(cats)))
}

// POST /api/categories (仅管理员)
pub async fn create_category(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Json(body): Json<CreateCategory>,
) -> AppResult<Json<ApiResponse<Category>>> {
    let id = new_id();
    let slug = body.slug
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| slugify(&body.name));
    let sort_order = body.sort_order.unwrap_or(0);

    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM categories WHERE slug = ? OR name = ?)"
    )
    .bind(&slug).bind(&body.name)
    .fetch_one(&state.pool)
    .await?;
    if exists {
        return Err(AppError::BadRequest("分类名或 slug 已存在".into()));
    }

    sqlx::query(
        "INSERT INTO categories (id, name, slug, description, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&id).bind(&body.name).bind(&slug)
    .bind(&body.description).bind(&body.parent_id).bind(sort_order)
    .execute(&state.pool)
    .await?;

    let cat = sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ?")
        .bind(&id).fetch_one(&state.pool).await?;
    Ok(Json(ApiResponse::ok(cat)))
}

// PUT /api/category/update?id=xxx (仅管理员)
pub async fn update_category(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Query(params): Query<IdParam>,
    Json(body): Json<UpdateCategory>,
) -> AppResult<Json<ApiResponse<Category>>> {
    let id = &params.id;
    let cat = sqlx::query_as::<_, Category>(
        "SELECT * FROM categories WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("分类不存在".into()))?;

    let name = body.name.as_deref().unwrap_or(&cat.name).to_string();
    let slug = body.slug.as_deref().unwrap_or(&cat.slug).to_string();
    let description = body.description.or(cat.description.clone());
    let parent_id = body.parent_id.or(cat.parent_id.clone());
    let sort_order = body.sort_order.unwrap_or(cat.sort_order);

    // 唯一性检查
    let conflict: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM categories WHERE (slug = ? OR name = ?) AND id != ?)"
    )
    .bind(&slug).bind(&name).bind(id)
    .fetch_one(&state.pool)
    .await?;
    if conflict {
        return Err(AppError::BadRequest("分类名或 slug 与其他分类冲突".into()));
    }

    sqlx::query(
        "UPDATE categories SET name=?, slug=?, description=?, parent_id=?, sort_order=? WHERE id=?"
    )
    .bind(&name).bind(&slug).bind(&description).bind(&parent_id).bind(sort_order).bind(id)
    .execute(&state.pool)
    .await?;

    let updated = sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ?")
        .bind(id).fetch_one(&state.pool).await?;
    Ok(Json(ApiResponse::ok(updated)))
}

// DELETE /api/category/delete?id=xxx (仅管理员)
pub async fn delete_category(
    State(state): State<Arc<AppState>>,
    _auth: AdminUser,
    Query(params): Query<IdParam>,
) -> AppResult<Json<serde_json::Value>> {
    let id = &params.id;
    sqlx::query("UPDATE posts SET category_id = NULL WHERE category_id = ?")
        .bind(id).execute(&state.pool).await?;
    sqlx::query("DELETE FROM categories WHERE id = ?")
        .bind(id).execute(&state.pool).await?;
    Ok(Json(serde_json::json!({ "code": 0, "message": "删除成功" })))
}
