use std::sync::Arc;

use axum::{
    extract::{FromRef, FromRequestParts},
    http::{request::Parts, HeaderMap},
    RequestPartsExt,
};
use axum_extra::{
    extract::CookieJar,
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};

use crate::{shared::error::AppError, state::AppState};

// Re-export hash and jwt functions for convenience
pub use crate::infra::hash::*;
pub use crate::infra::jwt::*;

#[derive(Debug, Clone, serde::Serialize)]
pub struct AuthUser {
    pub id: String,
    #[allow(dead_code)]
    pub username: String,
    pub role: String,
}

impl AuthUser {
    /// 面向后续 NGAC 演进的鉴权插槽。目前使用基础 Role-Based 判断，
    /// 后期可以在此通过 Graph / Policy 彻底改造判断逻辑而无需修改多处 Handler。
    pub fn has_permission(&self, action: &str) -> bool {
        match action {
            "admin:access" => self.role == "admin",
            _ => true,
        }
    }
}

#[derive(Debug, Clone)]
pub struct AdminUser(pub AuthUser);

pub fn session_token_from_headers(headers: &HeaderMap) -> Option<String> {
    CookieJar::from_headers(headers)
        .get("inkforge_session")
        .map(|cookie| cookie.value().to_string())
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .ok();

        let token = if let Some(TypedHeader(Authorization(bearer))) = auth_header {
            bearer.token().to_string()
        } else if let Some(cookie_token) = session_token_from_headers(&parts.headers) {
            cookie_token
        } else {
            tracing::debug!(
                module = "shared_auth",
                event = "auth_missing_credentials",
                path = %parts.uri.path(),
                "no credentials found on request"
            );
            return Err(AppError::Unauthorized);
        };

        let app_state = Arc::<AppState>::from_ref(state);
        let claims = match decode_token(&token, &app_state.config.auth.secret) {
            Ok(c) => c,
            Err(e) => {
                tracing::warn!(
                    module = "shared_auth",
                    event = "auth_token_decode_failed",
                    path = %parts.uri.path(),
                    error = ?e,
                    "token decode failed"
                );
                return Err(AppError::Unauthorized);
            }
        };

        tracing::debug!(
            module = "shared_auth",
            event = "auth_success",
            path = %parts.uri.path(),
            user_id = %claims.sub,
            username = %claims.username,
            role = %claims.role,
            "authentication succeeded"
        );

        Ok(Self {
            id: claims.sub,
            username: claims.username,
            role: claims.role,
        })
    }
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for AdminUser
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let user = AuthUser::from_request_parts(parts, state).await?;
        if !user.has_permission("admin:access") {
            tracing::warn!(
                module = "shared_auth",
                event = "admin_access_denied",
                path = %parts.uri.path(),
                user_id = %user.id,
                username = %user.username,
                role = %user.role,
                "admin access denied"
            );
            return Err(AppError::Forbidden);
        }
        tracing::debug!(
            module = "shared_auth",
            event = "admin_auth_success",
            path = %parts.uri.path(),
            admin_id = %user.id,
            username = %user.username,
            "admin authentication succeeded"
        );
        Ok(Self(user))
    }
}
