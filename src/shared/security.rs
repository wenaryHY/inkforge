use std::{collections::HashMap, sync::Arc, time::{Duration, Instant}};

use axum::{
    extract::{Request, State},
    http::{HeaderMap, HeaderValue},
    middleware::Next,
    response::Response,
};

use crate::{shared::error::AppError, state::AppState};

const LOGIN_WINDOW: Duration = Duration::from_secs(60);
const MAX_LOGIN_ATTEMPTS: u32 = 8;

#[derive(Debug, Default)]
pub struct LoginRateLimiter {
    attempts: HashMap<String, AttemptWindow>,
}

#[derive(Debug)]
struct AttemptWindow {
    count: u32,
    expires_at: Instant,
}

impl LoginRateLimiter {
    pub fn new() -> Self {
        Self::default()
    }

    fn allow(&mut self, key: String, now: Instant) -> bool {
        self.attempts.retain(|_, window| window.expires_at > now);
        self.attempts
            .entry(key)
            .or_insert_with(|| AttemptWindow::new(now))
            .record(now)
    }
}

impl AttemptWindow {
    fn new(now: Instant) -> Self {
        Self {
            count: 0,
            expires_at: now + LOGIN_WINDOW,
        }
    }

    fn record(&mut self, now: Instant) -> bool {
        if self.expires_at <= now {
            self.count = 0;
            self.expires_at = now + LOGIN_WINDOW;
        }
        self.count += 1;
        self.count <= MAX_LOGIN_ATTEMPTS
    }
}

fn forwarded_ip(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-forwarded-for")?
        .to_str()
        .ok()?
        .split(',')
        .next()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

fn client_key(headers: &HeaderMap) -> String {
    forwarded_ip(headers)
        .or_else(|| {
            headers
                .get("x-real-ip")
                .and_then(|value| value.to_str().ok())
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(ToOwned::to_owned)
        })
        .unwrap_or_else(|| "unknown".to_string())
}

pub async fn login_rate_limit(
    State(state): State<Arc<AppState>>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let key = client_key(request.headers());
    let allowed = {
        let mut limiter = state.login_rate_limiter.lock().await;
        limiter.allow(key.clone(), Instant::now())
    };

    if !allowed {
        tracing::warn!(
            module = "security",
            event = "login_rate_limited",
            client_key = %key,
            "login request blocked by rate limiter"
        );
        return Err(AppError::TooManyRequests(
            "too many login attempts, please retry in a minute".into(),
        ));
    }

    Ok(next.run(request).await)
}

pub async fn security_headers(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    let headers = response.headers_mut();
    headers.insert("X-Content-Type-Options", HeaderValue::from_static("nosniff"));
    headers.insert("X-Frame-Options", HeaderValue::from_static("SAMEORIGIN"));
    headers.insert(
        "Referrer-Policy",
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );
    headers.insert(
        "Permissions-Policy",
        HeaderValue::from_static("camera=(), microphone=(), geolocation=()"),
    );
    response
}
