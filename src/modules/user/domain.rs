use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct CurrentUser {
    pub id: String,
    pub username: String,
    pub email: String,
    pub display_name: String,
    pub avatar_media_id: Option<String>,
    pub bio: Option<String>,
    pub role: String,
    pub status: String,
    pub theme_preference: String,
    pub language: String,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}
