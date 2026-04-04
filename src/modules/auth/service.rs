use std::sync::Arc;

use crate::{
    modules::{auth::dto::RegisterRequest, setting::repository as setting_repository},
    shared::{
        auth::{hash_password, issue_token, verify_password},
        error::{AppError, AppResult},
    },
    state::AppState,
};

use super::{
    dto::{LoginRequest, TokenPayload},
    repository,
};

pub async fn register(state: Arc<AppState>, body: RegisterRequest) -> AppResult<TokenPayload> {
    let allow_register = setting_repository::get_bool(
        &state.pool,
        "allow_register",
        true,
    )
    .await?;

    if !allow_register {
        return Err(AppError::Forbidden);
    }

    if body.username.trim().len() < 3 {
        return Err(AppError::BadRequest("username must be at least 3 characters".into()));
    }
    if body.password.len() < 6 {
        return Err(AppError::BadRequest("password must be at least 6 characters".into()));
    }

    let exists = repository::exists_by_username_or_email(&state.pool, &body.username, &body.email).await?;
    if exists {
        return Err(AppError::Conflict("username or email already exists".into()));
    }

    let role = if repository::user_count(&state.pool).await? == 0 {
        "admin"
    } else {
        "member"
    };
    let display_name = body
        .display_name
        .unwrap_or_else(|| body.username.clone())
        .trim()
        .to_string();
    let password_hash = hash_password(&body.password)?;
    let user_id = repository::insert_user(
        &state.pool,
        body.username.trim(),
        body.email.trim(),
        &password_hash,
        &display_name,
        role,
    )
    .await?;

    let token = issue_token(state.as_ref(), user_id, body.username.trim().to_string(), role.to_string())?;
    Ok(TokenPayload { token })
}

pub async fn login(state: Arc<AppState>, body: LoginRequest) -> AppResult<TokenPayload> {
    let user = repository::find_by_login(&state.pool, body.login.trim())
        .await?
        .ok_or(AppError::Unauthorized)?;

    if user.status != "active" {
        return Err(AppError::Forbidden);
    }

    if !verify_password(&body.password, &user.password_hash)? {
        return Err(AppError::Unauthorized);
    }

    repository::touch_last_login(&state.pool, &user.id).await?;
    let token = issue_token(state.as_ref(), user.id, user.username, user.role)?;
    Ok(TokenPayload { token })
}
