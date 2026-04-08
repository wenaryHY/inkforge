use std::path::{Path, PathBuf};

use tokio::fs;

use crate::shared::error::AppError;

use super::traits::BackupStorageBackend;

#[derive(Clone)]
pub struct LocalBackupStorage {
    root_dir: PathBuf,
}

impl LocalBackupStorage {
    pub fn new(root_dir: PathBuf) -> Self {
        Self { root_dir }
    }

    fn build_path(&self, backup_id: &str, file_name: &str) -> PathBuf {
        self.root_dir.join(backup_id).join(file_name)
    }

    async fn ensure_parent(path: &Path) -> Result<(), AppError> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).await?;
        }
        Ok(())
    }
}

impl BackupStorageBackend for LocalBackupStorage {
    fn save<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
        data: &'a [u8],
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<String, AppError>> + Send + 'a>>
    {
        Box::pin(async move {
            let path = self.build_path(backup_id, file_name);
            Self::ensure_parent(&path).await?;
            fs::write(&path, data).await?;
            Ok(path.to_string_lossy().to_string())
        })
    }

    fn read<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<u8>, AppError>> + Send + 'a>>
    {
        Box::pin(async move {
            let path = self.build_path(backup_id, file_name);
            Ok(fs::read(path).await?)
        })
    }

    fn delete<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), AppError>> + Send + 'a>>
    {
        Box::pin(async move {
            let path = self.build_path(backup_id, file_name);
            if fs::try_exists(&path).await? {
                fs::remove_file(&path).await?;
            }
            let dir = self.root_dir.join(backup_id);
            if fs::try_exists(&dir).await? {
                let _ = fs::remove_dir(&dir).await;
            }
            Ok(())
        })
    }
}
