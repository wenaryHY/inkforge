use serde::{Deserialize, Serialize};
use crate::modules::theme::{ThemeConfig, ThemeConfigSchema, ThemeManifest};

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

/// 主题上传响应
#[derive(Debug, Serialize)]
pub struct ThemeUploadResponse {
    pub slug: String,
    pub name: String,
    pub version: String,
    pub message: String,
}
