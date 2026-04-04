use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    Json,
};

use crate::{
    shared::{
        auth::AdminUser,
        error::AppResult,
        response::{ApiResponse, PaginatedResponse},
    },
    state::AppState,
};

use super::{
    domain::{Category, Tag},
    dto::{
        AdminPostResponse, CreateCategoryRequest, CreatePostRequest, CreateTagRequest, PostQuery,
        PublicPostResponse, UpdateCategoryRequest,
    },
    service,
};

pub async fn list_categories(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<Vec<Category>>>> {
    Ok(Json(ApiResponse::success(service::list_categories(state).await?)))
}

pub async fn list_tags(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<Vec<Tag>>>> {
    Ok(Json(ApiResponse::success(service::list_tags(state).await?)))
}

pub async fn list_public_posts(
    State(state): State<Arc<AppState>>,
    Query(query): Query<PostQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<super::domain::PublicPostSummary>>>> {
    Ok(Json(ApiResponse::success(
        service::list_public_posts(state, query).await?,
    )))
}

pub async fn get_public_post(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> AppResult<Json<ApiResponse<PublicPostResponse>>> {
    Ok(Json(ApiResponse::success(service::get_public_post(state, &slug).await?)))
}

pub async fn list_admin_posts(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Query(query): Query<PostQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<AdminPostResponse>>>> {
    Ok(Json(ApiResponse::success(
        service::list_admin_posts(state, query).await?,
    )))
}

pub async fn get_admin_post(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<AdminPostResponse>>> {
    Ok(Json(ApiResponse::success(service::get_admin_post(state, &id).await?)))
}

pub async fn create_post(
    State(state): State<Arc<AppState>>,
    admin: AdminUser,
    Json(body): Json<CreatePostRequest>,
) -> AppResult<Json<ApiResponse<AdminPostResponse>>> {
    Ok(Json(ApiResponse::success(
        service::create_post(state, &admin.0, body).await?,
    )))
}

pub async fn update_post(
    State(state): State<Arc<AppState>>,
    admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<super::dto::UpdatePostRequest>,
) -> AppResult<Json<ApiResponse<AdminPostResponse>>> {
    Ok(Json(ApiResponse::success(
        service::update_post(state, &admin.0, &id, body).await?,
    )))
}

pub async fn delete_post(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(service::delete_post(state, &id).await?)))
}

pub async fn create_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<CreateCategoryRequest>,
) -> AppResult<Json<ApiResponse<Category>>> {
    Ok(Json(ApiResponse::success(service::create_category(state, body).await?)))
}

pub async fn update_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateCategoryRequest>,
) -> AppResult<Json<ApiResponse<Category>>> {
    Ok(Json(ApiResponse::success(
        service::update_category(state, &id, body).await?,
    )))
}

pub async fn delete_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(service::delete_category(state, &id).await?)))
}

pub async fn create_tag(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<CreateTagRequest>,
) -> AppResult<Json<ApiResponse<Tag>>> {
    Ok(Json(ApiResponse::success(service::create_tag(state, body).await?)))
}

pub async fn delete_tag(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(service::delete_tag(state, &id).await?)))
}
