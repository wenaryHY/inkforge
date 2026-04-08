use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}
