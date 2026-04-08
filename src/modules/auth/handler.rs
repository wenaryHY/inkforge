use std::sync::Arc;

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};

use crate::{
    shared::{error::AppResult, json::AppJson, response::ApiResponse},
    state::AppState,
};

use super::{
    dto::{LoginRequest, RegisterRequest},
    service,
};

pub async fn register(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    AppJson(body): AppJson<RegisterRequest>,
) -> AppResult<axum::response::Response> {
    let client_request_id =
        crate::shared::request_id::extract_or_generate_client_request_id(&headers);
    tracing::info!(
        module = "auth",
        event = "register_request",
        client_request_id = %client_request_id,
        username = %body.username,
        email = %body.email,
        has_display_name = body.display_name.as_deref().map(|value| !value.trim().is_empty()).unwrap_or(false),
        "received registration request"
    );
    let payload = service::register(state, body).await?;
    let cookie_val = build_session_cookie(&payload.token);
    let cookie_header = axum::http::HeaderValue::from_str(&cookie_val).unwrap();
    let json = Json(ApiResponse::success(payload));

    let mut headers = axum::http::HeaderMap::new();
    headers.insert(axum::http::header::SET_COOKIE, cookie_header);
    Ok((headers, json).into_response())
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    AppJson(body): AppJson<LoginRequest>,
) -> AppResult<axum::response::Response> {
    let client_request_id =
        crate::shared::request_id::extract_or_generate_client_request_id(&headers);
    tracing::info!(
        module = "auth",
        event = "login_request",
        client_request_id = %client_request_id,
        login = %body.login,
        "received login request"
    );
    let payload = service::login(state, body).await?;
    let cookie_val = build_session_cookie(&payload.token);
    let cookie_header = axum::http::HeaderValue::from_str(&cookie_val).unwrap();
    let json = Json(ApiResponse::success(payload));

    let mut headers = axum::http::HeaderMap::new();
    headers.insert(axum::http::header::SET_COOKIE, cookie_header);
    Ok((headers, json).into_response())
}

pub async fn logout(headers: HeaderMap) -> axum::response::Response {
    let client_request_id =
        crate::shared::request_id::extract_or_generate_client_request_id(&headers);
    tracing::info!(
        module = "auth",
        event = "logout_request",
        client_request_id = %client_request_id,
        "received logout request"
    );
    let json = Json(ApiResponse::success(
        serde_json::json!({ "logged_out": true }),
    ));
    let clear_cookie = "inkforge_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax";
    let cookie_header = axum::http::HeaderValue::from_static(clear_cookie);
    let mut headers = axum::http::HeaderMap::new();
    headers.insert(axum::http::header::SET_COOKIE, cookie_header);
    (headers, json).into_response()
}

fn build_session_cookie(token: &str) -> String {
    // 86400 seconds = 1 day
    format!(
        "inkforge_session={}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax",
        token
    )
}
