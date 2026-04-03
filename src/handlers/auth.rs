use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use axum::{extract::State, Json};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::{
    error::{AppError, AppResult},
    middleware::auth::Claims,
    models::{ApiResponse, CreateUser, LoginRequest, UserPublic, new_id},
    state::AppState,
};

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateUser>,
) -> AppResult<Json<Value>> {
    // 检查 allow_register 设置
    let allow: String = sqlx::query_scalar("SELECT value FROM settings WHERE key = 'allow_register'")
        .fetch_one(&state.pool)
        .await
        .unwrap_or_else(|_| "false".to_string());
    if allow != "true" {
        return Err(AppError::Forbidden);
    }

    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM users WHERE username = ? OR email = ?)"
    )
    .bind(&body.username)
    .bind(&body.email)
    .fetch_one(&state.pool)
    .await?;

    if exists {
        return Err(AppError::BadRequest("用户名或邮箱已存在".into()));
    }

    let salt = SaltString::generate(&mut OsRng);
    let hashed = Argon2::default()
        .hash_password(body.password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("密码加密失败: {}", e)))?
        .to_string();

    let id = new_id();
    let display_name = body.display_name.unwrap_or_else(|| body.username.clone());

    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&state.pool)
        .await?;
    let role = if count == 0 { "admin" } else { "editor" };

    sqlx::query(
        "INSERT INTO users (id, username, email, password, display_name, role) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&id).bind(&body.username).bind(&body.email)
    .bind(&hashed).bind(&display_name).bind(role)
    .execute(&state.pool)
    .await?;

    Ok(Json(json!({ "code": 0, "message": "注册成功", "data": { "id": id } })))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(body): Json<LoginRequest>,
) -> AppResult<Json<Value>> {
    let user = sqlx::query_as::<_, (String, String, String, String)>(
        "SELECT id, username, password, role FROM users WHERE username = ?"
    )
    .bind(&body.username)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::BadRequest("用户名或密码错误".into()))?;

    let (id, username, hashed_pw, role) = user;

    let parsed_hash = PasswordHash::new(&hashed_pw)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("密码解析失败")))?;

    Argon2::default()
        .verify_password(body.password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::BadRequest("用户名或密码错误".into()))?;

    // 使用 AppState 中的 JWT 密钥
    let exp = chrono::Utc::now().timestamp() + state.jwt_expires_in;
    let claims = Claims { sub: id, username, role, exp };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(anyhow::anyhow!("Token 生成失败: {}", e)))?;

    Ok(Json(json!({ "code": 0, "message": "ok", "data": { "token": token } })))
}

pub async fn me(
    State(state): State<Arc<AppState>>,
    auth: crate::middleware::auth::AuthUser,
) -> AppResult<Json<ApiResponse<UserPublic>>> {
    let user = sqlx::query_as::<_, UserPublic>(
        "SELECT id, username, display_name, avatar, bio FROM users WHERE id = ?"
    )
    .bind(&auth.0.sub)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("用户不存在".into()))?;

    Ok(Json(ApiResponse::ok(user)))
}
