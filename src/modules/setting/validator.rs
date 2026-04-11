use crate::shared::error::{AppError, AppResult};

pub fn normalize_site_url(value: &str) -> AppResult<String> {
    let url = parse_http_url(value, "site_url must be a valid absolute http/https URL")?;
    ensure_root_path(&url)?;
    Ok(url.origin().unicode_serialization())
}

pub fn normalize_admin_url(value: &str) -> AppResult<String> {
    let url = parse_http_url(value, "admin_url must be a valid absolute http/https URL")?;
    ensure_admin_path(&url)?;
    Ok(format!("{}/admin", url.origin().unicode_serialization()))
}

pub fn canonical_admin_url_from_site_url(site_url: &str) -> AppResult<String> {
    let url = parse_http_url(site_url, "site_url must be a valid absolute http/https URL")?;
    ensure_root_path(&url)?;
    Ok(format!("{}/admin", url.origin().unicode_serialization()))
}


pub fn normalize_bool_string(value: &str, field: &str) -> AppResult<String> {
    match value.trim() {
        "true" => Ok("true".to_string()),
        "false" => Ok("false".to_string()),
        _ => Err(AppError::BadRequest(format!("{field} must be true or false"))),
    }
}

fn parse_http_url(value: &str, message: &str) -> AppResult<url::Url> {
    let trimmed = value.trim();
    let url = url::Url::parse(trimmed).map_err(|_| AppError::BadRequest(message.into()))?;
    ensure_supported_scheme(&url)?;
    ensure_no_auth_query_fragment(&url)?;
    Ok(url)
}

fn ensure_supported_scheme(url: &url::Url) -> AppResult<()> {
    if matches!(url.scheme(), "http" | "https") {
        return Ok(());
    }
    Err(AppError::BadRequest(
        "URL scheme must be http or https".into(),
    ))
}

fn ensure_no_auth_query_fragment(url: &url::Url) -> AppResult<()> {
    if !url.username().is_empty() || url.password().is_some() {
        return Err(AppError::BadRequest(
            "URL must not contain username or password".into(),
        ));
    }
    if url.query().is_some() || url.fragment().is_some() {
        return Err(AppError::BadRequest(
            "URL must not contain query or fragment".into(),
        ));
    }
    Ok(())
}

fn ensure_root_path(url: &url::Url) -> AppResult<()> {
    if url.path() == "/" {
        return Ok(());
    }
    Err(AppError::BadRequest(
        "site_url must not contain any path".into(),
    ))
}

fn ensure_admin_path(url: &url::Url) -> AppResult<()> {
    let path = url.path().trim_end_matches('/');
    if path == "/admin" {
        return Ok(());
    }
    Err(AppError::BadRequest(
        "admin_url path must be /admin".into(),
    ))
}
