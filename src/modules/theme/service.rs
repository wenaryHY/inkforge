use std::{
    collections::HashMap,
    io::{Cursor, Read},
    path::{Path, PathBuf},
    sync::Arc,
};

use axum::extract::Multipart;
use minijinja::Environment;
use serde::Serialize;
use uuid::Uuid;
use zip::ZipArchive;

use crate::{
    modules::{
        post::repository as post_repository,
        setting::repository as setting_repository,
    },
    shared::error::{AppError, AppResult},
    state::AppState,
};

use super::domain::{ThemeManifest, ThemeSummary};

fn read_manifest(path: &Path) -> AppResult<ThemeManifest> {
    Ok(config::Config::builder()
        .add_source(config::File::from(path.to_path_buf()))
        .build()?
        .try_deserialize()?)
}

pub async fn active_theme_slug(state: &AppState) -> AppResult<String> {
    Ok(setting_repository::get_string(
        &state.pool,
        "active_theme",
        &state.config.theme.active_theme_fallback,
    )
    .await?)
}

pub fn theme_root(state: &AppState, slug: &str) -> PathBuf {
    state.theme_dir.join(slug)
}

fn validate_theme_structure(root: &Path) -> AppResult<ThemeManifest> {
    let manifest_path = root.join("theme.toml");
    if !manifest_path.exists() {
        return Err(AppError::BadRequest("theme.toml is missing".into()));
    }
    for required in ["templates/index.html", "templates/post.html"] {
        if !root.join(required).exists() {
            return Err(AppError::BadRequest(format!("required theme file is missing: {required}")));
        }
    }
    read_manifest(&manifest_path)
}

fn find_theme_root(temp_dir: &Path) -> AppResult<PathBuf> {
    if temp_dir.join("theme.toml").exists() {
        return Ok(temp_dir.to_path_buf());
    }

    for entry in std::fs::read_dir(temp_dir)? {
        let entry = entry?;
        if entry.file_type()?.is_dir() && entry.path().join("theme.toml").exists() {
            return Ok(entry.path());
        }
    }

    Err(AppError::BadRequest("theme archive does not contain a valid theme root".into()))
}

fn copy_dir_all(src: &Path, dst: &Path) -> AppResult<()> {
    std::fs::create_dir_all(dst)?;
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let target = dst.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_all(&entry.path(), &target)?;
        } else {
            std::fs::copy(entry.path(), target)?;
        }
    }
    Ok(())
}

fn move_theme_directory(src: &Path, dst: &Path) -> AppResult<()> {
    if std::fs::rename(src, dst).is_ok() {
        return Ok(());
    }
    copy_dir_all(src, dst)?;
    std::fs::remove_dir_all(src)?;
    Ok(())
}

pub async fn list_themes(state: Arc<AppState>) -> AppResult<Vec<ThemeSummary>> {
    let active_slug = active_theme_slug(state.as_ref()).await?;
    let mut items = Vec::new();

    for entry in std::fs::read_dir(&state.theme_dir)? {
        let entry = entry?;
        if !entry.file_type()?.is_dir() {
            continue;
        }

        let manifest_path = entry.path().join("theme.toml");
        if !manifest_path.exists() {
            continue;
        }

        let manifest = read_manifest(&manifest_path)?;
        items.push(ThemeSummary {
            active: manifest.slug == active_slug,
            manifest,
        });
    }

    items.sort_by(|a, b| a.manifest.slug.cmp(&b.manifest.slug));
    Ok(items)
}

pub async fn activate_theme(state: Arc<AppState>, slug: &str) -> AppResult<()> {
    let manifest_path = theme_root(state.as_ref(), slug).join("theme.toml");
    if !manifest_path.exists() {
        return Err(AppError::NotFound);
    }

    let _ = read_manifest(&manifest_path)?;
    setting_repository::upsert(&state.pool, "active_theme", slug).await?;
    Ok(())
}

pub async fn upload_theme_archive(
    state: Arc<AppState>,
    mut multipart: Multipart,
) -> AppResult<ThemeSummary> {
    let field = multipart
        .next_field()
        .await
        .map_err(|err| AppError::BadRequest(format!("invalid multipart field: {err}")))?
        .ok_or_else(|| AppError::BadRequest("theme file is required".into()))?;

    let file_name = field
        .file_name()
        .ok_or_else(|| AppError::BadRequest("theme file name is required".into()))?
        .to_string();
    if !file_name.to_lowercase().ends_with(".zip") {
        return Err(AppError::BadRequest("theme upload only supports zip archives".into()));
    }

    let bytes = field
        .bytes()
        .await
        .map_err(|err| AppError::BadRequest(format!("failed to read upload: {err}")))?;
    let temp_dir = std::env::temp_dir().join(format!("inkforge-theme-{}", Uuid::new_v4()));
    std::fs::create_dir_all(&temp_dir)?;

    let cursor = Cursor::new(bytes.to_vec());
    let mut archive = ZipArchive::new(cursor)
        .map_err(|err| AppError::BadRequest(format!("invalid zip archive: {err}")))?;

    for index in 0..archive.len() {
        let mut entry = archive
            .by_index(index)
            .map_err(|err| AppError::BadRequest(format!("invalid zip entry: {err}")))?;
        let enclosed = entry
            .enclosed_name()
            .ok_or_else(|| AppError::BadRequest("zip archive contains unsafe paths".into()))?
            .to_path_buf();
        let out_path = temp_dir.join(enclosed);

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path)?;
            continue;
        }

        if let Some(parent) = out_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let mut output = std::fs::File::create(&out_path)?;
        let mut buffer = Vec::new();
        entry
            .read_to_end(&mut buffer)
            .map_err(|err| AppError::BadRequest(format!("failed to extract zip entry: {err}")))?;
        std::io::Write::write_all(&mut output, &buffer)?;
    }

    let source_root = find_theme_root(&temp_dir)?;
    let manifest = validate_theme_structure(&source_root)?;
    let destination = theme_root(state.as_ref(), &manifest.slug);
    if destination.exists() {
        return Err(AppError::Conflict("theme slug already exists".into()));
    }

    move_theme_directory(&source_root, &destination)?;
    if temp_dir.exists() {
        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    let active_slug = active_theme_slug(state.as_ref()).await?;
    Ok(ThemeSummary {
        active: manifest.slug == active_slug,
        manifest,
    })
}

pub async fn render_template<T: Serialize>(
    state: Arc<AppState>,
    name: &str,
    payload: T,
) -> AppResult<String> {
    let slug = active_theme_slug(state.as_ref()).await?;
    let template_path = theme_root(state.as_ref(), &slug).join("templates").join(name);
    let template_source = std::fs::read_to_string(template_path)?;

    let mut env = Environment::new();
    env.add_template(name, &template_source)
        .map_err(|err| AppError::Anyhow(anyhow::anyhow!("template compile error: {err}")))?;
    let tmpl = env
        .get_template(name)
        .map_err(|err| AppError::Anyhow(anyhow::anyhow!("template load error: {err}")))?;

    tmpl.render(payload)
        .map_err(|err| AppError::Anyhow(anyhow::anyhow!("template render error: {err}")))
}

pub async fn home_payload(state: Arc<AppState>) -> AppResult<HashMap<&'static str, serde_json::Value>> {
    let site_title = setting_repository::get_string(&state.pool, "site_title", "InkForge").await?;
    let site_description = setting_repository::get_string(&state.pool, "site_description", "").await?;
    let mode = setting_repository::get_string(
        &state.pool,
        "theme_default_mode",
        &state.config.theme.default_mode,
    )
    .await?;
    let posts = post_repository::list_recent_public_posts(&state.pool, 10).await?;

    Ok(HashMap::from([
        ("site_title", serde_json::json!(site_title)),
        ("site_description", serde_json::json!(site_description)),
        ("theme_mode", serde_json::json!(mode)),
        ("posts", serde_json::to_value(posts).unwrap_or_else(|_| serde_json::json!([]))),
    ]))
}

pub async fn post_payload(
    state: Arc<AppState>,
    slug: &str,
) -> AppResult<HashMap<&'static str, serde_json::Value>> {
    let site_title = setting_repository::get_string(&state.pool, "site_title", "InkForge").await?;
    let post = post_repository::get_public_post_by_slug(&state.pool, slug)
        .await?
        .ok_or(AppError::NotFound)?;
    let comments = crate::modules::comment::repository::list_approved_for_post(&state.pool, &post.id).await?;

    Ok(HashMap::from([
        ("site_title", serde_json::json!(site_title)),
        ("post", serde_json::to_value(post).unwrap_or(serde_json::Value::Null)),
        ("comments", serde_json::to_value(comments).unwrap_or_else(|_| serde_json::json!([]))),
    ]))
}
