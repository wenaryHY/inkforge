use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct SettingItem {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSettingRequest {
    pub key: String,
    pub value: String,
}
