use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, Query, State},
    response::Response,
};
use futures_util::stream::StreamExt;
use futures_util::SinkExt;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;

use crate::state::AppState;
use crate::middleware::auth::Claims;

// ─── Server Event ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum ServerEvent {
    #[serde(rename = "comment_created")]
    CommentCreated {
        id: String,
        post_id: String,
        author_name: String,
        content: String,
        status: String,
        created_at: String,
    },
    #[serde(rename = "comment_approved")]
    CommentApproved {
        id: String,
        post_id: String,
        author_name: String,
        content: String,
        created_at: String,
    },
    #[serde(rename = "comment_deleted")]
    CommentDeleted {
        id: String,
    },
}

// ─── Admin WebSocket ────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct WsAdminParams {
    token: String,
}

pub async fn ws_admin_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    Query(params): Query<WsAdminParams>,
) -> Response {
    // 验证 JWT token
    let claims = match verify_token(&params.token) {
        Some(c) => c,
        None => return Response::builder().status(401).body("Unauthorized".into()).unwrap(),
    };
    if claims.role != "admin" {
        return Response::builder().status(403).body("Forbidden".into()).unwrap();
    }

    ws.on_upgrade(move |socket| handle_ws(socket, state.event_tx.subscribe(), None))
}

// ─── Public WebSocket ───────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct WsPublicParams {
    post_id: Option<String>,
}

pub async fn ws_public_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    Query(params): Query<WsPublicParams>,
) -> Response {
    let post_id = params.post_id;
    ws.on_upgrade(move |socket| handle_ws(socket, state.event_tx.subscribe(), post_id))
}

// ─── Common WS Loop ─────────────────────────────────────────────────────────

/// 通用 WebSocket 消息推送循环
///
/// - `post_id`：前台连接时传入文章 ID，仅推送该文章的 approved 事件；管理后台传 None 推送全部事件
async fn handle_ws(socket: WebSocket, mut rx: broadcast::Receiver<ServerEvent>, post_id: Option<String>) {
    let (mut sender, mut receiver) = socket.split();

    // 独立 task：接收客户端消息
    let _recv_task = tokio::spawn(async move {
        while let Some(msg) = receiver.next().await {
            match msg {
                Ok(Message::Close(_)) => break,
                _ => {} // 忽略其他消息
            }
        }
    });

    // 主循环：从 broadcast channel 读取事件并推送给客户端
    while let Ok(event) = rx.recv().await {
        // 如果是前台连接（有 post_id），只推送该文章的 approved 事件
        if let Some(ref pid) = post_id {
            match &event {
                ServerEvent::CommentApproved { post_id, .. } if post_id == pid => {
                    // 推送
                }
                _ => continue, // 跳过不相关事件
            }
        }

        let json = match serde_json::to_string(&event) {
            Ok(j) => j,
            Err(_) => continue,
        };

        if sender.send(Message::Text(json.into())).await.is_err() {
            break; // 客户端断开
        }
    }
}

// ─── JWT Verify Helper ──────────────────────────────────────────────────────

fn verify_token(token: &str) -> Option<Claims> {
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "inkforge-change-me-in-production".to_string());

    jsonwebtoken::decode::<Claims>(
        token,
        &jsonwebtoken::DecodingKey::from_secret(secret.as_bytes()),
        &jsonwebtoken::Validation::default(),
    )
    .ok()
    .map(|data| data.claims)
}
