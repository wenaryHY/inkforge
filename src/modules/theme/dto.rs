use serde::{Deserialize, Serialize};
use crate::modules::theme::{ThemeConfig, ThemeConfigSchema, ThemeManifest};

/// 获取主题列表响应
#[derive(Debug, Serialize)]
pub struct ListThemesResponse {
    pub themes: Vec<ThemeInfo>,
    pub active_theme: String,
}

/// 主题信息（列表项）
#[derive(Debug, Clone, Serialize)]
pub struct ThemeInfo {
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub version: String,
    pub author: Option<String>,
    pub preview_image: Option<String>,
    pub is_active: bool,
}

/// 主题详情响应（包含 manifest + 当前配置 + schema）
#[derive(Debug, Serialize)]
pub struct ThemeDetailResponse {
    pub manifest: ThemeManifest,
    pub config: ThemeConfig,
    pub schema: ThemeConfigSchema,
}

/// 保存主题配置请求
#[derive(Debug, Deserialize)]
pub struct SaveThemeConfigRequest {
    pub config: ThemeConfig,
}

/// 激活主题请求
#[derive(Debug, Deserialize)]
pub struct ActivateThemeRequest {
    pub slug: String,
}

/// 激活主题响应
#[derive(Debug, Serialize)]
pub struct ActivateThemeResponse {
    pub success: bool,
    pub message: String,
}

/// 获取活跃主题响应
#[derive(Debug, Serialize)]
pub struct GetActiveThemeResponse {
    pub slug: String,
}

/// 主题上传响应
#[derive(Debug, Serialize)]
pub struct ThemeUploadResponse {
    pub slug: String,
    pub name: String,
    pub version: String,
    pub message: String,
}
