use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::shared::error::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub username: String,
    pub role: String,
    pub exp: i64,
}

/// 签发 JWT，不依赖 AppState — 解耦架构：infra 层不应了解 state 层
pub fn issue_token(
    secret: &str,
    expires_in_seconds: i64,
    user_id: String,
    username: String,
    role: String,
) -> Result<String, AppError> {
    let exp = chrono::Utc::now().timestamp() + expires_in_seconds;
    let claims = Claims {
        sub: user_id,
        username,
        role,
        exp,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|err| AppError::Anyhow(anyhow::anyhow!("failed to issue token: {err}")))
}

/// 验证 JWT，不依赖 AppState
pub fn decode_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| AppError::Unauthorized)
}
