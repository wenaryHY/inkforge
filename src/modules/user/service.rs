use std::sync::Arc;

use crate::{
    shared::{
        auth::{hash_password, verify_password, AuthUser},
        error::{AppError, AppResult},
    },
    state::AppState,
};

use super::{
    domain::CurrentUser,
    dto::{UpdatePasswordRequest, UpdateProfileRequest},
    repository,
};

pub async fn me(state: Arc<AppState>, auth: &AuthUser) -> AppResult<CurrentUser> {
    repository::find_current(&state.pool, &auth.id)
        .await?
        .ok_or(AppError::Unauthorized)
}

pub async fn update_profile(
    state: Arc<AppState>,
    auth: &AuthUser,
    body: UpdateProfileRequest,
) -> AppResult<CurrentUser> {
    let theme_preference = body
        .theme_preference
        .unwrap_or_else(|| "system".to_string());
    if !matches!(theme_preference.as_str(), "system" | "light" | "dark") {
        return Err(AppError::BadRequest("invalid theme preference".into()));
    }

    repository::update_profile(
        &state.pool,
        &auth.id,
        body.display_name.trim(),
        body.bio.as_deref(),
        body.avatar_media_id.as_deref(),
        &theme_preference,
    )
    .await?;

    me(state, auth).await
}

pub async fn update_password(
    state: Arc<AppState>,
    auth: &AuthUser,
    body: UpdatePasswordRequest,
) -> AppResult<serde_json::Value> {
    if body.new_password.len() < 6 {
        return Err(AppError::BadRequest(
            "new password must be at least 6 characters".into(),
        ));
    }

    let current_hash = repository::find_password_hash(&state.pool, &auth.id)
        .await?
        .ok_or(AppError::Unauthorized)?;
    if !verify_password(&body.current_password, &current_hash)? {
        return Err(AppError::Unauthorized);
    }

    let new_hash = hash_password(&body.new_password)?;
    repository::update_password(&state.pool, &auth.id, &new_hash).await?;
    Ok(serde_json::json!({ "updated": true }))
}
