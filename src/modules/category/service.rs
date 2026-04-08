use std::sync::Arc;

use slug::slugify;

use crate::{
    shared::error::{AppError, AppResult},
    state::AppState,
};

use super::{
    domain::Category,
    dto::{CreateCategoryRequest, UpdateCategoryRequest},
    repository,
};

pub async fn list_categories(state: Arc<AppState>) -> AppResult<Vec<Category>> {
    Ok(repository::list_categories(&state.pool).await?)
}

pub async fn create_category(
    state: Arc<AppState>,
    body: CreateCategoryRequest,
) -> AppResult<Category> {
    if body.name.trim().is_empty() {
        return Err(AppError::BadRequest("category name is required".into()));
    }
    let slug = body
        .slug
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| slugify(&body.name));
    if repository::category_slug_or_name_exists(&state.pool, &slug, body.name.trim(), None).await? {
        return Err(AppError::Conflict(
            "category slug or name already exists".into(),
        ));
    }
    let id = repository::insert_category(
        &state.pool,
        body.name.trim(),
        &slug,
        body.description.as_deref(),
        body.parent_id.as_deref(),
        body.sort_order.unwrap_or(0),
    )
    .await?;
    repository::get_category(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)
}

pub async fn update_category(
    state: Arc<AppState>,
    id: &str,
    body: UpdateCategoryRequest,
) -> AppResult<Category> {
    let current = repository::get_category(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)?;
    let name = body.name.unwrap_or(current.name.clone());
    let slug = body.slug.unwrap_or(current.slug.clone());
    if repository::category_slug_or_name_exists(&state.pool, &slug, &name, Some(id)).await? {
        return Err(AppError::Conflict(
            "category slug or name already exists".into(),
        ));
    }
    repository::update_category(
        &state.pool,
        id,
        &name,
        &slug,
        body.description
            .as_deref()
            .or(current.description.as_deref()),
        body.parent_id.as_deref().or(current.parent_id.as_deref()),
        body.sort_order.unwrap_or(current.sort_order),
    )
    .await?;
    repository::get_category(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)
}

pub async fn delete_category(state: Arc<AppState>, id: &str) -> AppResult<serde_json::Value> {
    repository::delete_category(&state.pool, id).await?;
    Ok(serde_json::json!({ "deleted": true }))
}
