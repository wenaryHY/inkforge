use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeManifest {
    pub name: String,
    pub slug: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub min_inkforge_version: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ThemeSummary {
    pub manifest: ThemeManifest,
    pub active: bool,
}
