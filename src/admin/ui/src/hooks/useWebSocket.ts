import { useEffect, useRef, useCallback } from 'react';
import { getToken } from '../lib/api';

type WSEventType = 'comment_created' | 'comment_approved' | 'comment_deleted';
type WSHandler = (event: { type: WSEventType }) => void;

export function useWebSocket(onEvent?: WSHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    const token = getToken();
    if (!token) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${location.host}/ws/admin?token=${encodeURIComponent(token)}`;
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log('[InkForge WS] 已连接');
      attemptsRef.current = 0;
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    wsRef.current.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        console.log('[InkForge WS] 收到事件:', event.type);
        onEventRef.current?.(event as { type: WSEventType });
      } catch (err) {
        console.error('[InkForge WS] 解析消息失败:', err);
      }
    };

    wsRef.current.onclose = () => {
      console.log('[InkForge WS] 连接断开');
      wsRef.current = null;
      // 指数退避重连
      const t = getToken();
      if (t && !timerRef.current) {
        const delay = Math.min(1000 * Math.pow(2, attemptsRef.current), 30000);
        attemptsRef.current += 1;
        timerRef.current = setTimeout(() => { timerRef.current = null; connect(); }, delay);
      }
    };
  }, []);

  const close = useCallback(() => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    attemptsRef.current = 0;
  }, []);

  useEffect(() => {
    connect();
    return () => close();
  }, [connect, close]);

  return { reconnect: connect, close };
}
