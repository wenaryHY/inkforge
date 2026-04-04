use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use thiserror::Error;

use super::response::ApiResponse;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("resource not found")]
    NotFound,
    #[error("unauthorized")]
    Unauthorized,
    #[error("forbidden")]
    Forbidden,
    #[error("bad request: {0}")]
    BadRequest(String),
    #[error("conflict: {0}")]
    Conflict(String),
    #[error(transparent)]
    Config(#[from] config::ConfigError),
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Anyhow(#[from] anyhow::Error),
}

pub type AppResult<T> = Result<T, AppError>;

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            Self::NotFound => (StatusCode::NOT_FOUND, 40400, "resource not found".to_string()),
            Self::Unauthorized => (StatusCode::UNAUTHORIZED, 40100, "unauthorized".to_string()),
            Self::Forbidden => (StatusCode::FORBIDDEN, 40300, "forbidden".to_string()),
            Self::BadRequest(msg) => (StatusCode::BAD_REQUEST, 40000, msg),
            Self::Conflict(msg) => (StatusCode::CONFLICT, 40900, msg),
            Self::Sqlx(err) => {
                tracing::error!(error = ?err, "database error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    50000,
                    "internal server error".to_string(),
                )
            }
            Self::Config(err) => {
                tracing::error!(error = ?err, "config error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    50000,
                    "internal server error".to_string(),
                )
            }
            Self::Io(err) => {
                tracing::error!(error = ?err, "io error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    50000,
                    "internal server error".to_string(),
                )
            }
            Self::Anyhow(err) => {
                tracing::error!(error = ?err, "application error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    50000,
                    "internal server error".to_string(),
                )
            }
        };

        (status, Json(ApiResponse::<()>::error(code, message))).into_response()
    }
}
