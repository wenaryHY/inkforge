use anyhow::Result;
use sqlx::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    sqlx::query(include_str!("../migrations/001_init.sql"))
        .execute(pool)
        .await?;
    tracing::info!("数据库迁移完成");
    Ok(())
}
