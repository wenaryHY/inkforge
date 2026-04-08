use std::future::Future;
use std::pin::Pin;

use crate::shared::error::AppError;

#[allow(dead_code)]
pub trait BackupStorageBackend: Send + Sync {
    fn save<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
        data: &'a [u8],
    ) -> Pin<Box<dyn Future<Output = Result<String, AppError>> + Send + 'a>>;

    fn read<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<Vec<u8>, AppError>> + Send + 'a>>;

    fn delete<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<(), AppError>> + Send + 'a>>;
}
