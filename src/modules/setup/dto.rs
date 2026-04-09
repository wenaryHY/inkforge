use serde::{Deserialize, Serialize};

use super::domain::SetupStage;

#[derive(Debug, Serialize)]
pub struct SetupStatusResponse {
    pub installed: bool,
    pub stage: SetupStage,
    pub site_title: String,
    pub site_description: String,
    pub site_url: String,
    pub admin_url: String,
    pub allow_register: bool,
}

#[derive(Debug, Deserialize)]
pub struct SetupInitializeRequest {
    pub site_title: String,
    pub site_description: String,
    pub site_url: String,
    pub admin_url: String,
    pub allow_register: bool,
    pub username: String,
    pub email: String,
    pub password: String,
    pub display_name: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SetupInitializeResponse {
    pub token: String,
    pub redirect_to: String,
}
