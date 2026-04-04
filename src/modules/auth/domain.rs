use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct UserRow {
    pub id: String,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub display_name: String,
    pub avatar_media_id: Option<String>,
    pub bio: Option<String>,
    pub role: String,
    pub status: String,
    pub theme_preference: String,
    pub created_at: String,
    pub updated_at: String,
    pub last_login_at: Option<String>,
}
