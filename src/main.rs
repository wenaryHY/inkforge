mod admin;
mod bootstrap;
mod modules;
mod shared;
mod state;

use std::{net::SocketAddr, sync::Arc};

use bootstrap::{config::AppConfig, router::build_router};
use sqlx::sqlite::SqlitePoolOptions;
use state::AppState;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "inkforge=info,axum=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = AppConfig::load()?;
    std::fs::create_dir_all(&config.storage.upload_dir)?;
    std::fs::create_dir_all(&config.theme.theme_dir)?;

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&config.database.url)
        .await?;
    sqlx::query("PRAGMA foreign_keys = ON").execute(&pool).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    let state = Arc::new(AppState::new(config.clone(), pool)?);
    let app = build_router(state);

    let addr = SocketAddr::new(config.server.host.parse()?, config.server.port);
    tracing::info!("InkForge listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
