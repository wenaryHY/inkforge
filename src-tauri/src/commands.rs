// Tauri IPC 命令
// 供前端 invoke() 调用

use tauri::AppHandle;

use crate::window;

/// 安装完成后，前端调用此命令触发窗口跳转
/// 关闭安装向导窗口，打开后台管理窗口
#[tauri::command]
pub async fn switch_to_admin(app: AppHandle) -> Result<(), String> {
    window::switch_to_admin(&app)
}

/// 可选：前端查询 sidecar 是否就绪（当前仅做健康检查）
#[tauri::command]
pub async fn get_server_status() -> Result<String, String> {
    let url = "http://127.0.0.1:2000/api/v1/health";

    match reqwest::get(url).await {
        Ok(resp) if resp.status().is_success() => Ok("ready".to_string()),
        Ok(resp) => Ok(format!("unhealthy: {}", resp.status())),
        Err(e) => Ok(format!("unreachable: {}", e)),
    }
}
