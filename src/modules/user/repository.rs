use sqlx::SqlitePool;

use super::domain::CurrentUser;

pub async fn find_current(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<Option<CurrentUser>, sqlx::Error> {
    sqlx::query_as::<_, CurrentUser>(
        "SELECT id, username, email, display_name, avatar_media_id, bio, role, status, theme_preference, language, created_at, updated_at, deleted_at
         FROM users
         WHERE id = ? AND deleted_at IS NULL",
    )
        .bind(user_id)
        .fetch_optional(pool)
        .await
}

pub async fn find_password_hash(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<Option<String>, sqlx::Error> {
    sqlx::query_scalar("SELECT password_hash FROM users WHERE id = ?")
        .bind(user_id)
        .fetch_optional(pool)
        .await
}

pub async fn update_profile(
    pool: &SqlitePool,
    user_id: &str,
    display_name: &str,
    bio: Option<&str>,
    avatar_media_id: Option<&str>,
    theme_preference: &str,
    language: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE users
         SET display_name = ?, bio = ?, avatar_media_id = ?, theme_preference = ?, language = ?, updated_at = datetime('now')
         WHERE id = ?",
    )
    .bind(display_name)
    .bind(bio)
    .bind(avatar_media_id)
    .bind(theme_preference)
    .bind(language)
    .bind(user_id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn update_password(
    pool: &SqlitePool,
    user_id: &str,
    password_hash: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(password_hash)
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(())
}
