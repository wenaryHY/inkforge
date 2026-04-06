use std::future::Future;
use std::path::PathBuf;
use std::pin::Pin;
use tokio::fs;

use crate::shared::error::AppError;
use super::traits::StorageBackend;

pub struct LocalStorage {
    pub base_dir: PathBuf,
    pub base_url: String,
}

impl LocalStorage {
    pub fn new(base_dir: PathBuf, base_url: String) -> Self {
        Self { base_dir, base_url }
    }
}

impl StorageBackend for LocalStorage {
    fn save<'a>(
        &'a self,
        file_data: &'a [u8],
        path: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<String, AppError>> + Send + 'a>> {
        Box::pin(async move {
            let full_path = self.base_dir.join(path);
            if let Some(parent) = full_path.parent() {
                fs::create_dir_all(parent).await?;
            }
            fs::write(&full_path, file_data).await?;
            Ok(path.to_string())
        })
    }

    fn delete<'a>(
        &'a self,
        path: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<(), AppError>> + Send + 'a>> {
        Box::pin(async move {
            let full_path = self.base_dir.join(path);
            if full_path.exists() {
                fs::remove_file(full_path).await?;
            }
            Ok(())
        })
    }

    fn exists<'a>(
        &'a self,
        path: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<bool, AppError>> + Send + 'a>> {
        Box::pin(async move {
            let full_path = self.base_dir.join(path);
            Ok(full_path.exists())
        })
    }

    fn get_public_url(&self, path: &str) -> String {
        format!("{}/{}", self.base_url.trim_end_matches('/'), path)
    }
}
