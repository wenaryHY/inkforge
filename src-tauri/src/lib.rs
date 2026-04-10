// InkForge 桌面应用核心库
// 管理 Tauri 应用生命周期：sidecar 启动、健康检查、窗口路由

mod commands;
mod sidecar;
mod window;

use std::sync::Mutex;
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::process::CommandChild;

/// 全局 sidecar 进程句柄，确保应用退出时能 kill sidecar
struct SidecarHandle(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarHandle(Mutex::new(None)))
        .setup(|app| {
            let app_handle = app.handle().clone();

            // 在独立 tokio 任务中完成启动流程，避免阻塞 Tauri 主线程
            tauri::async_runtime::spawn(async move {
                // 1. 启动 inkforge sidecar
                match sidecar::spawn_inkforge(&app_handle) {
                    Ok(child) => {
                        // 持久化 sidecar 句柄，供退出时 kill
                        if let Some(state) = app_handle.try_state::<SidecarHandle>() {
                            let mut guard = state.0.lock().unwrap();
                            *guard = Some(child);
                        }
                    }
                    Err(e) => {
                        tracing::error!("failed to spawn inkforge sidecar: {}", e);
                        // sidecar 启动失败时显示错误窗口（降级：仍尝试继续）
                    }
                }

                // 2. 等待 sidecar 就绪（健康检查）
                if let Err(e) = sidecar::wait_ready(2000).await {
                    tracing::error!("{}", e);
                    // 超时后仍打开窗口，sidecar 可能需要更长时间
                }

                // 3. 查询安装状态，决定打开哪个窗口
                let stage = sidecar::get_setup_stage(2000)
                    .await
                    .unwrap_or_else(|_| "not_started".to_string());

                tracing::info!("setup stage: {}", stage);

                if stage == "completed" {
                    if let Err(e) = window::open_admin_window(&app_handle) {
                        tracing::error!("failed to open admin window: {}", e);
                    }
                } else {
                    if let Err(e) = window::open_setup_window(&app_handle) {
                        tracing::error!("failed to open setup window: {}", e);
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::switch_to_admin,
            commands::get_server_status,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            // 所有窗口关闭时 kill sidecar，防止孤立进程
            if let RunEvent::ExitRequested { .. } = event {
                if let Some(state) = app_handle.try_state::<SidecarHandle>() {
                    let mut guard = state.0.lock().unwrap();
                    if let Some(child) = guard.take() {
                        let _ = child.kill();
                        tracing::info!("inkforge sidecar killed on exit");
                    }
                }
            }
        });
}
