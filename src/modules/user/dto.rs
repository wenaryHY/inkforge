use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub display_name: Option<String>,
    pub bio: Option<Option<String>>,
    pub avatar_media_id: Option<Option<String>>,
    pub theme_preference: Option<String>,
    pub language: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}
