use axum::http::HeaderMap;

pub const CLIENT_REQUEST_ID_HEADER: &str = "x-client-request-id";

pub fn extract_client_request_id(headers: &HeaderMap) -> Option<String> {
    headers
        .get(CLIENT_REQUEST_ID_HEADER)
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

pub fn extract_or_generate_client_request_id(headers: &HeaderMap) -> String {
    extract_client_request_id(headers)
        .unwrap_or_else(|| format!("srv_{}", uuid::Uuid::new_v4()))
}
