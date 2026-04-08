use std::sync::Arc;

use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header, HeaderValue},
    Json,
};

use crate::{
    shared::{
        auth::AdminUser,
        error::{AppError, AppResult},
        response::{ApiResponse, PaginatedResponse},
    },
    state::AppState,
};

use super::{
    category,
    domain::MediaItem,
    dto::{
        CreateMediaCategoryRequest, MediaQuery, RenameMediaRequest, UpdateCategoryRequest,
        UpdateMediaCategoryCrudRequest,
    },
    service, MediaCategory,
};

type UploadResponse = ApiResponse<MediaItem>;

pub async fn list_media(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Query(query): Query<MediaQuery>,
) -> AppResult<Json<ApiResponse<PaginatedResponse<MediaItem>>>> {
    Ok(Json(ApiResponse::success(
        service::list_media(state, query).await?,
    )))
}

/// 手动解析 multipart 请求，避免 Axum extractor 顺序问题
pub async fn upload_media(
    State(state): State<Arc<AppState>>,
    admin: AdminUser,
    req: axum::http::Request<Body>,
) -> AppResult<Json<UploadResponse>> {
    let (parts, body) = req.into_parts();

    // 手动解析 multipart：先读 Content-Type 提取 boundary
    let content_type = parts
        .headers
        .get(header::CONTENT_TYPE)
        .and_then(|v: &HeaderValue| v.to_str().ok())
        .ok_or_else(|| AppError::BadRequest("Missing Content-Type header".into()))?;

    let boundary = extract_multipart_boundary(content_type).ok_or_else(|| {
        AppError::BadRequest("Invalid multipart Content-Type, missing boundary".into())
    })?;

    // 将 body 收集为 bytes
    let bytes = axum::body::to_bytes(body, 64 * 1024 * 1024) // 最大 64MB
        .await
        .map_err(|e| AppError::BadRequest(format!("failed to read request body: {e}")))?;

    // 手动解析 multipart parts
    let parts = parse_multipart_parts(&bytes, &boundary)?;

    // 从 multipart 中提取 category 字段
    let category = parts
        .iter()
        .find(|p| p.name == "category")
        .and_then(|p| String::from_utf8(p.data.clone()).ok());

    let file_part = parts
        .into_iter()
        .find(|p| p.name == "file")
        .ok_or_else(|| AppError::BadRequest("file field is required".into()))?;

    let result = service::upload_media_raw(
        state,
        &admin.0,
        file_part.filename.unwrap_or_else(|| "untitled".to_string()),
        file_part.content_type,
        file_part.data,
        category,
    )
    .await?;

    Ok(Json(ApiResponse::success(result))) // type: Json<UploadResponse> where UploadResponse = ApiResponse<MediaItem>
}

fn extract_multipart_boundary(content_type: &str) -> Option<String> {
    for segment in content_type.split(';') {
        let segment = segment.trim();
        if segment.starts_with("boundary=") {
            return Some(segment[9..].trim_matches('"').to_string());
        }
    }
    None
}

struct MultipartPart {
    name: String,
    filename: Option<String>,
    content_type: Option<String>,
    data: Vec<u8>,
}

fn parse_multipart_parts(body: &[u8], boundary: &str) -> AppResult<Vec<MultipartPart>> {
    let boundary_bytes = format!("--{}", boundary).into_bytes();
    let end_boundary_bytes = format!("--{}--", boundary).into_bytes();

    let mut parts = Vec::new();
    let mut pos = 0;

    while pos < body.len() {
        // 找下一个 boundary
        let Some(b_start) = find_bytes(&body[pos..], &boundary_bytes) else {
            break;
        };
        pos += b_start + boundary_bytes.len();

        // 跳过 \r\n
        if body.get(pos) == Some(&b'\r') {
            pos += 1;
        }
        if body.get(pos) == Some(&b'\n') {
            pos += 1;
        }

        // 检查是否是 end boundary
        if pos < body.len() && body[pos] == b'-' {
            if body
                .get(pos..)
                .map(|s| s.starts_with(&end_boundary_bytes))
                .unwrap_or(false)
            {
                break;
            }
        }

        // 解析 part headers（直到空行）
        let header_end = find_bytes(&body[pos..], b"\r\n\r\n").map(|i| pos + i);
        let header_block = header_end.map(|end| &body[pos..end]);
        pos = header_end.map(|end| end + 4).unwrap_or(pos);

        // 解析 Content-Disposition
        let mut name = String::new();
        let mut filename = Option::<String>::None;
        let mut content_type = Option::<String>::None;

        if let Some(headers) = header_block {
            if let Ok(header_str) = std::str::from_utf8(headers) {
                for line in header_str.lines() {
                    let line_lower = line.to_lowercase();
                    if line_lower.starts_with("content-disposition:") {
                        for token in line.split(';').skip(1) {
                            let token = token.trim();
                            if token.starts_with("name=") {
                                name = unquote(token[5..].trim());
                            } else if token.starts_with("filename=") {
                                filename = Some(unquote(token[9..].trim()));
                            }
                        }
                    } else if line_lower.starts_with("content-type:") {
                        content_type = Some(line[13..].trim().to_string());
                    }
                }
            }
        }

        if name.is_empty() {
            continue;
        }

        // 找 part 内容结尾（下一个 boundary 前的 \r\n）
        let data_end = find_bytes(&body[pos..], &boundary_bytes)
            .map(|i| pos + i)
            .unwrap_or(body.len());

        // 去掉末尾的 \r\n
        let mut data_end = data_end;
        if data_end > 0 && body[data_end - 1] == b'\n' {
            data_end -= 1;
        }
        if data_end > 0 && body[data_end - 1] == b'\r' {
            data_end -= 1;
        }

        parts.push(MultipartPart {
            name,
            filename,
            content_type,
            data: body[pos..data_end].to_vec(),
        });

        pos = data_end;
        if body.get(pos) == Some(&b'\r') {
            pos += 1;
        }
        if body.get(pos) == Some(&b'\n') {
            pos += 1;
        }
    }

    Ok(parts)
}

fn find_bytes(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|w| w == needle)
}

fn unquote(s: &str) -> String {
    s.trim_matches('"').to_string()
}

pub async fn delete_media(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::delete_media(state, &id).await?,
    )))
}

pub async fn rename_media(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<RenameMediaRequest>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::rename_media(state, &id, &body.name).await?,
    )))
}

pub async fn update_media_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateCategoryRequest>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        service::update_category(state, &id, body.category.as_deref()).await?,
    )))
}

pub async fn list_media_categories(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
) -> AppResult<Json<ApiResponse<Vec<MediaCategory>>>> {
    Ok(Json(ApiResponse::success(
        category::list_categories(state).await?,
    )))
}

pub async fn create_media_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Json(body): Json<CreateMediaCategoryRequest>,
) -> AppResult<Json<ApiResponse<MediaCategory>>> {
    Ok(Json(ApiResponse::success(
        category::create_category(state, body).await?,
    )))
}

pub async fn update_media_category_crud(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
    Json(body): Json<UpdateMediaCategoryCrudRequest>,
) -> AppResult<Json<ApiResponse<MediaCategory>>> {
    Ok(Json(ApiResponse::success(
        category::update_category(state, &id, body).await?,
    )))
}

pub async fn delete_media_category(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(id): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    Ok(Json(ApiResponse::success(
        category::delete_category(state, &id).await?,
    )))
}
