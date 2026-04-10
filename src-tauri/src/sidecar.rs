// sidecar 生命周期管理
// 负责拉起 inkforge Axum 二进制，健康检查，进程退出联动

use std::time::Duration;
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

/// 等待 inkforge sidecar 服务就绪（最多 10 秒）
/// 每 500ms 轮询 /api/v1/health，超时返回 Err
pub async fn wait_ready(port: u16) -> Result<(), String> {
    let url = format!("http://127.0.0.1:{}/api/v1/health", port);

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .map_err(|e| e.to_string())?;

    let max_attempts = 20; // 20 * 500ms = 10s
    for i in 0..max_attempts {
        match client.get(&url).send().await {
            Ok(resp) if resp.status().is_success() => {
                tracing::info!("inkforge sidecar ready after {} attempts", i + 1);
                return Ok(());
            }
            _ => {
                tokio::time::sleep(Duration::from_millis(500)).await;
            }
        }
    }
    Err(format!(
        "inkforge sidecar did not become ready within 10 seconds on port {}",
        port
    ))
}

/// 查询安装状态，返回 setup_stage 字符串
/// 可能的值: not_started | admin_created | configured | completed
pub async fn get_setup_stage(port: u16) -> Result<String, String> {
    let url = format!("http://127.0.0.1:{}/api/v1/setup/status", port);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let resp: serde_json::Value = client
        .get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let stage = resp
        .get("data")
        .and_then(|d| d.get("stage"))
        .and_then(|s| s.as_str())
        .unwrap_or("not_started")
        .to_string();

    Ok(stage)
}

/// 启动 inkforge sidecar 进程
/// 返回 sidecar 进程句柄，由调用方持有生命周期
pub fn spawn_inkforge(
    app: &AppHandle,
) -> Result<tauri_plugin_shell::process::CommandChild, String> {
    let sidecar_cmd = app
        .shell()
        .sidecar("inkforge")
        .map_err(|e| format!("failed to build sidecar command: {}", e))?;

    let (_, child) = sidecar_cmd
        .spawn()
        .map_err(|e| format!("failed to spawn inkforge sidecar: {}", e))?;

    tracing::info!("inkforge sidecar spawned");
    Ok(child)
}
