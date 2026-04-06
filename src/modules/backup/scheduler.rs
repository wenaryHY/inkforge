use std::sync::Arc;

use tokio_cron_scheduler::{Job, JobScheduler};

use crate::{shared::error::AppError, state::AppState};

use super::{domain::{BackupProvider, BackupScheduleFrequency}, repository, service};

pub async fn start_backup_scheduler(state: Arc<AppState>) -> Result<(), AppError> {
    let schedule = repository::get_or_create_schedule(&state.pool).await?;
    if !schedule.enabled {
        tracing::info!("backup scheduler disabled, skipping startup");
        return Ok(());
    }

    let frequency = BackupScheduleFrequency::from_str(&schedule.frequency)
        .ok_or_else(|| AppError::BadRequest("invalid backup frequency".into()))?;
    let provider = BackupProvider::from_str(&schedule.provider)
        .ok_or_else(|| AppError::BadRequest("invalid backup provider".into()))?;

    let cron = frequency.cron_expression(schedule.hour as u32, schedule.minute as u32);
    let scheduler = JobScheduler::new()
        .await
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("create scheduler failed: {e}")))?;

    let cloned = state.clone();
    let job = Job::new_async(cron.as_str(), move |_id, _lock| {
        let state = cloned.clone();
        Box::pin(async move {
            if let Err(err) = service::create_backup(state, provider).await {
                tracing::error!(error = ?err, "scheduled backup execution failed");
            }
        })
    })
    .map_err(|e| AppError::Anyhow(anyhow::anyhow!("create backup job failed: {e}")))?;

    scheduler
        .add(job)
        .await
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("register backup job failed: {e}")))?;
    scheduler
        .start()
        .await
        .map_err(|e| AppError::Anyhow(anyhow::anyhow!("start backup scheduler failed: {e}")))?;

    tracing::info!(cron = %cron, "backup scheduler started");
    std::mem::forget(scheduler);
    Ok(())
}
