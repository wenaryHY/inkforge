use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBackupRequest {
    pub provider: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupListResponse {
    pub id: String,
    pub created_at: String,
    pub size: i64,
    pub provider: String,
    pub status: String,
    pub error_message: Option<String>,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct RestoreBackupRequest {
    pub backup_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RestoreProgressResponse {
    pub step: String,
    pub status: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupScheduleRequest {
    pub enabled: bool,
    pub frequency: String,
    pub hour: u32,
    pub minute: u32,
    pub provider: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupScheduleResponse {
    pub id: String,
    pub enabled: bool,
    pub frequency: String,
    pub hour: u32,
    pub minute: u32,
    pub provider: String,
    pub last_run_at: Option<String>,
    pub next_run_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}
