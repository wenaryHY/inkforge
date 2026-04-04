use std::sync::Arc;

use axum::{extract::State, Json};

use crate::{
    shared::{
        auth::AuthUser,
        error::AppResult,
        response::ApiResponse,
    },
    state::AppState,
};

use super::{dto::{UpdatePasswordRequest, UpdateProfileRequest}, service};

pub async fn me(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> AppResult<Json<ApiResponse<super::domain::CurrentUser>>> {
    Ok(Json(ApiResponse::success(service::me(state, &auth).await?)))
}

pub async fn update_profile(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(body): Json<UpdateProfileRequest>,
) -> AppResult<Json<ApiResponse<super::domain::CurrentUser>>> {
    Ok(Json(ApiResponse::success(
        service::update_profile(state, &auth, body).await?,
    )))
}

pub async fn update_password(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(body): Json<UpdatePasswordRequest>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::update_password(state, &auth, body).await?,
    )))
}
