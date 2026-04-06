use std::sync::Arc;

use axum::{
    extract::{Multipart, Path, State},
    Json,
};

use crate::{
    shared::{
        auth::AdminUser,
        error::AppResult,
        response::ApiResponse,
    },
    state::AppState,
};

use super::{domain::ThemeSummary, service::ThemeService};

pub async fn active_theme(
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    let service = ThemeService::new(state.theme_dir.clone());
    let slug = service.list_themes(&state.pool).await?.1;
    Ok(Json(ApiResponse::success(serde_json::json!({ "slug": slug }))))
}

pub async fn list_themes(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
) -> AppResult<Json<ApiResponse<Vec<ThemeSummary>>>> {
    let service = ThemeService::new(state.theme_dir.clone());
    let (manifests, active_slug) = service.list_themes(&state.pool).await?;
    let summaries = manifests
        .into_iter()
        .map(|manifest| ThemeSummary {
            active: manifest.slug == active_slug,
            manifest,
        })
        .collect();
    Ok(Json(ApiResponse::success(summaries)))
}

pub async fn activate_theme(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(slug): Path<String>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    let service = ThemeService::new(state.theme_dir.clone());
    service.activate_theme(&state.pool, &slug).await?;
    Ok(Json(ApiResponse::success(serde_json::json!({ "activated": slug }))))
}

pub async fn get_theme_detail(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(slug): Path<String>,
) -> AppResult<Json<ApiResponse<super::dto::ThemeDetailResponse>>> {
    let service = ThemeService::new(state.theme_dir.clone());
    let (manifest, config) = service.get_theme_detail(&state.pool, &slug).await?;
    let schema = manifest.config.clone();
    Ok(Json(ApiResponse::success(super::dto::ThemeDetailResponse {
        manifest,
        config,
        schema,
    })))
}

pub async fn save_theme_config(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    Path(slug): Path<String>,
    Json(req): Json<super::dto::SaveThemeConfigRequest>,
) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
    let service = ThemeService::new(state.theme_dir.clone());
    service.save_theme_config(&state.pool, &slug, &req.config).await?;
    Ok(Json(ApiResponse::success(serde_json::json!({ "saved": slug }))))
}

pub async fn upload_theme_archive(
    State(state): State<Arc<AppState>>,
    _admin: AdminUser,
    mut multipart: Multipart,
) -> AppResult<Json<ApiResponse<super::dto::ThemeUploadResponse>>> {
    let mut theme_data: Option<Vec<u8>> = None;
    
    // 提取上传的文件
    while let Some(field) = multipart.next_field().await? {
        if field.name() == Some("file") {
            theme_data = Some(field.bytes().await?.to_vec());
            break;
        }
    }
    
    let theme_data = theme_data
        .ok_or(crate::shared::error::AppError::BadRequest("No file uploaded".to_string()))?;
    
    // 解析 zip 包
    let cursor = std::io::Cursor::new(theme_data);
    let mut archive = zip::ZipArchive::new(cursor)
        .map_err(|_| crate::shared::error::AppError::BadRequest("Invalid zip file".to_string()))?;
    
    // 查找 theme.toml
    let mut manifest_content = String::new();
    {
        let mut theme_toml = archive
            .by_name("theme.toml")
            .map_err(|_| crate::shared::error::AppError::BadRequest(
                "theme.toml not found in archive".to_string(),
            ))?;
        std::io::Read::read_to_string(&mut theme_toml, &mut manifest_content)
            .map_err(|e| crate::shared::error::AppError::Io(e))?;
    }
    
    // 解析 manifest
    let manifest: super::ThemeManifest = toml::from_str(&manifest_content)
        .map_err(|e| crate::shared::error::AppError::BadRequest(
            format!("Failed to parse theme.toml: {}", e),
        ))?;
    
    // 提取主题到 themes 目录
    let theme_dir = state.theme_dir.join(&manifest.slug);
    if theme_dir.exists() {
        std::fs::remove_dir_all(&theme_dir)
            .map_err(|e| crate::shared::error::AppError::Io(e))?;
    }
    std::fs::create_dir_all(&theme_dir)
        .map_err(|e| crate::shared::error::AppError::Io(e))?;
    
    // 解压所有文件
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| crate::shared::error::AppError::Anyhow(anyhow::anyhow!("Failed to read archive: {}", e)))?;
        
        let outpath = theme_dir.join(file.name());
        
        if file.is_dir() {
            std::fs::create_dir_all(&outpath)
                .map_err(|e| crate::shared::error::AppError::Io(e))?;
        } else {
            if let Some(p) = outpath.parent() {
                std::fs::create_dir_all(p)
                    .map_err(|e| crate::shared::error::AppError::Io(e))?;
            }
            let mut outfile = std::fs::File::create(&outpath)
                .map_err(|e| crate::shared::error::AppError::Io(e))?;
            std::io::copy(&mut file, &mut outfile)
                .map_err(|e| crate::shared::error::AppError::Io(e))?;
        }
    }
    
    Ok(Json(ApiResponse::success(super::dto::ThemeUploadResponse {
        slug: manifest.slug.clone(),
        name: manifest.name.clone(),
        version: manifest.version.clone(),
        message: "主题已上传".to_string(),
    })))
}
