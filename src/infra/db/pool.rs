use anyhow::Result;
use sqlx::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    sqlx::query(include_str!("../../../migrations/001_init.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("../../../migrations/002_add_posts_fts5.sql"))
        .execute(pool)
        .await?;
    // 003: 添加 media.category 字段（忽略已存在错误）
    sqlx::query(include_str!("../../../migrations/003_add_media_category.sql"))
        .execute(pool)
        .await
        .ok();
    tracing::info!("数据库迁移完成");
    Ok(())
}
