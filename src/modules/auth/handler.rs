use std::sync::Arc;

use axum::{extract::State, Json};

use crate::{
    shared::{
        error::AppResult,
        response::ApiResponse,
    },
    state::AppState,
};

use super::{dto::{LoginRequest, RegisterRequest}, service};

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(body): Json<RegisterRequest>,
) -> AppResult<Json<ApiResponse<super::dto::TokenPayload>>> {
    Ok(Json(ApiResponse::success(service::register(state, body).await?)))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(body): Json<LoginRequest>,
) -> AppResult<Json<ApiResponse<super::dto::TokenPayload>>> {
    Ok(Json(ApiResponse::success(service::login(state, body).await?)))
}

pub async fn logout() -> Json<ApiResponse<serde_json::Value>> {
    Json(ApiResponse::success(serde_json::json!({ "logged_out": true })))
}
