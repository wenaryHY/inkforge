/**
 * InkForge 前台评论系统
 * 独立的 TypeScript 模块，通过 window.__POST_DATA__ 获取服务端注入的数据
 */

/** Toast 通知 */
function showToast(msg: string, type: 'success' | 'error' | 'info' = 'info'): void {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const colors: Record<string, string> = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  Object.assign(toast.style, {
    background: colors[type] || colors.info,
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
    opacity: '0',
    transform: 'translateX(40px)',
    transition: 'all .3s ease',
    maxWidth: '360px',
  });
  toast.textContent = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/** HTML 转义 */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 提交评论 */
async function submitComment(e: Event): Promise<void> {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const fd = new FormData(form);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postId = (window as any).__POST_DATA__?.id || '';

  const body = {
    post_id: postId,
    author_name: fd.get('author_name'),
    author_email: fd.get('author_email'),
    author_url: fd.get('author_url'),
    content: fd.get('content'),
  };

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const r = await res.json();

    if (r.code === 0) {
      showToast('评论已提交，等待管理员审核后即可显示！', 'success');
      form.reset();
    } else {
      showToast(r.message || '提交失败', 'error');
    }
  } catch {
    showToast('网络错误，请重试', 'error');
  }
}

/** WebSocket 实时评论 */
function initCommentWebSocket(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postId = (window as any).__POST_DATA__?.id;
  if (!postId) return;

  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  let reconnectDelay = 1000;

  function connect(): void {
    const ws = new WebSocket(
      `${protocol}//${location.host}/ws/public?post_id=${encodeURIComponent(postId)}`
    );

    ws.onopen = () => {
      console.log('[InkForge WS] 前台评论连接成功');
      reconnectDelay = 1000;
    };

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === 'comment_approved' && event.data.post_id === postId) {
          const list = document.getElementById('comment-list');
          const countEl = document.getElementById('comment-count');

          if (list) {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.style.cssText = 'animation:fadeIn .4s ease;';
            const name = event.data.author_name || '?';
            const avatar = name.charAt(0);
            const time = (event.data.created_at || '').substring(0, 16);
            item.innerHTML = `
              <div class="comment-header">
                <div class="comment-avatar">${esc(avatar)}</div>
                <div>
                  <span class="comment-author">${esc(name)}</span>
                  <span class="comment-time">${time}</span>
                </div>
              </div>
              <div class="comment-content">${esc(event.data.content)}</div>
            `;
            list.appendChild(item);
          }

          if (countEl) {
            const current = parseInt(countEl.textContent || '0') || 0;
            countEl.textContent = String(current + 1);
          }
          showToast('新评论来了！', 'info');
        }
      } catch (err) {
        console.error('[InkForge WS] 解析失败:', err);
      }
    };

    ws.onclose = () => {
      console.log(`[InkForge WS] 断开，${reconnectDelay / 1000} 秒后重连`);
      setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    };

    ws.onerror = () => {};
  }

  connect();
}

/** 初始化 */
function initComments(): void {
  // 绑定表单提交
  const form = document.querySelector('.comment-form');
  if (form) {
    form.addEventListener('submit', submitComment);
  }

  // 初始化 WebSocket
  initCommentWebSocket();

  // 添加 fadeIn 动画（如果不存在）
  if (!document.getElementById('inkforge-fadein-style')) {
    const style = document.createElement('style');
    style.id = 'inkforge-fadein-style';
    style.textContent =
      '@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }';
    document.head.appendChild(style);
  }
}

// 挂载到全局
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).initComments = initComments;
