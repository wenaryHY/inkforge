use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("未找到: {0}")]
    NotFound(String),
    #[error("未授权")]
    Unauthorized,
    #[error("禁止访问")]
    Forbidden,
    #[error("参数错误: {0}")]
    BadRequest(String),
    #[error("内部错误: {0}")]
    Internal(#[from] anyhow::Error),
    #[error("数据库错误: {0}")]
    Database(#[from] sqlx::Error),
    #[error("IO 错误: {0}")]
    Io(#[from] std::io::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound(msg)    => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Unauthorized     => (StatusCode::UNAUTHORIZED, "未授权".into()),
            AppError::Forbidden        => (StatusCode::FORBIDDEN, "禁止访问".into()),
            AppError::BadRequest(msg)  => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Internal(e)      => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            AppError::Database(e)      => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            AppError::Io(e)            => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
        };
        (status, Json(json!({ "code": status.as_u16(), "message": message }))).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
