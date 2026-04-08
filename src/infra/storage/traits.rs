use std::future::Future;
use std::pin::Pin;

use crate::shared::error::AppError;

pub trait StorageBackend: Send + Sync {
    fn save<'a>(
        &'a self,
        file_data: &'a [u8],
        path: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<String, AppError>> + Send + 'a>>;

    fn delete<'a>(
        &'a self,
        path: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<(), AppError>> + Send + 'a>>;

    fn exists<'a>(
        &'a self,
        path: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<bool, AppError>> + Send + 'a>>;

    fn get_public_url(&self, path: &str) -> String;
}
