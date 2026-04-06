use aws_sdk_s3::{primitives::ByteStream, Client};

use crate::shared::error::AppError;

use super::traits::BackupStorageBackend;

#[derive(Clone)]
pub struct S3BackupStorage {
    client: Client,
    bucket: String,
    prefix: String,
}

impl S3BackupStorage {
    pub fn new(client: Client, bucket: String, prefix: String) -> Self {
        Self {
            client,
            bucket,
            prefix,
        }
    }

    fn key(&self, backup_id: &str, file_name: &str) -> String {
        let prefix = self.prefix.trim_matches('/');
        if prefix.is_empty() {
            format!("{}/{}", backup_id, file_name)
        } else {
            format!("{}/{}/{}", prefix, backup_id, file_name)
        }
    }
}

impl BackupStorageBackend for S3BackupStorage {
    fn save<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
        data: &'a [u8],
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<String, AppError>> + Send + 'a>> {
        Box::pin(async move {
            let key = self.key(backup_id, file_name);
            self.client
                .put_object()
                .bucket(&self.bucket)
                .key(&key)
                .body(ByteStream::from(data.to_vec()))
                .send()
                .await
                .map_err(|e| AppError::Anyhow(anyhow::anyhow!("S3 upload failed: {e}")))?;
            Ok(key)
        })
    }

    fn read<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<u8>, AppError>> + Send + 'a>> {
        Box::pin(async move {
            let key = self.key(backup_id, file_name);
            let output = self.client
                .get_object()
                .bucket(&self.bucket)
                .key(&key)
                .send()
                .await
                .map_err(|e| AppError::Anyhow(anyhow::anyhow!("S3 download failed: {e}")))?;

            let data = output
                .body
                .collect()
                .await
                .map_err(|e| AppError::Anyhow(anyhow::anyhow!("S3 body collect failed: {e}")))?;
            Ok(data.into_bytes().to_vec())
        })
    }

    fn delete<'a>(
        &'a self,
        backup_id: &'a str,
        file_name: &'a str,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), AppError>> + Send + 'a>> {
        Box::pin(async move {
            let key = self.key(backup_id, file_name);
            self.client
                .delete_object()
                .bucket(&self.bucket)
                .key(&key)
                .send()
                .await
                .map_err(|e| AppError::Anyhow(anyhow::anyhow!("S3 delete failed: {e}")))?;
            Ok(())
        })
    }
}
