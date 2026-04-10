import { useEffect, useMemo, useRef, useState } from 'react';
import { IconClock } from './Icons';

interface TimePickerProps {
  label?: string;
  hint?: string;
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}

const quickTimes = [
  { hour: 2, minute: 0, label: '02:00' },
  { hour: 3, minute: 0, label: '03:00' },
  { hour: 4, minute: 0, label: '04:00' },
  { hour: 23, minute: 0, label: '23:00' },
];

export function TimePicker({ label, hint, hour, minute, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 420, maxHeight: 432 });

  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const displayValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  const updatePopupPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const panelWidth = Math.min(520, Math.max(380, rect.width + 32));
    const panelHeight = Math.min(432, window.innerHeight - 16);
    const maxLeft = Math.max(8, window.innerWidth - panelWidth - 8);
    const left = Math.min(Math.max(8, rect.left), maxLeft);
    const preferTop = rect.bottom + 10;
    const top = preferTop + panelHeight > window.innerHeight - 8
      ? Math.max(8, rect.top - panelHeight - 10)
      : preferTop;
    setPopupPos({ top, left, width: panelWidth, maxHeight: panelHeight });
  };

  useEffect(() => {
    if (!open) return;

    updatePopupPosition();
    const onReposition = () => updatePopupPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        popupRef.current &&
        !containerRef.current.contains(target) &&
        !popupRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const preventBackgroundScroll = (e: WheelEvent | TouchEvent) => {
      const target = e.target as Node;
      if (popupRef.current && popupRef.current.contains(target)) return;
      e.preventDefault();
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('wheel', preventBackgroundScroll, { passive: false, capture: true });
    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false, capture: true });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('wheel', preventBackgroundScroll, { capture: true } as EventListenerOptions);
      document.removeEventListener('touchmove', preventBackgroundScroll, { capture: true } as EventListenerOptions);
    };
  }, [open]);

  const selectTime = (nextHour: number, nextMinute: number, close = false) => {
    onChange(nextHour, nextMinute);
    if (close) setOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} ref={containerRef}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--md-on-surface-variant)' }}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          minHeight: '56px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: open ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)',
          color: 'var(--md-on-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          transition: 'background var(--transition-normal), box-shadow var(--transition-normal)',
          boxShadow: open ? '0 0 0 2px var(--md-primary)' : 'none',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>{displayValue}</span>
          <span style={{ fontSize: '12px', color: 'var(--md-on-surface-variant)' }}>点击调整每日自动清理时间</span>
        </div>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: open ? 'var(--md-surface-container-high)' : 'var(--md-surface-container)',
          color: 'var(--md-on-surface-variant)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconClock size={16} />
        </div>
      </button>

      {open && (
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: popupPos.top,
            left: popupPos.left,
            width: Math.max(380, popupPos.width),
            maxHeight: popupPos.maxHeight,
            background: 'var(--md-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--elevation-2)',
            zIndex: 9999,
            padding: '18px',
            animation: 'pickerPop 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--md-outline)' }}>
              每日自动清理
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--md-on-surface)' }}>{displayValue}</span>
              <span style={{ fontSize: '12px', color: 'var(--md-on-surface-variant)' }}>推荐设置在凌晨，降低对访问高峰的影响</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {quickTimes.map((item) => {
              const active = item.hour === hour && item.minute === minute;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => selectTime(item.hour, item.minute, true)}
                  style={{
                    height: '34px',
                    padding: '0 14px',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    background: active ? 'var(--md-surface-container-highest)' : 'var(--md-surface-container-low)',
                    color: active ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
                    fontSize: '12.5px',
                    fontWeight: active ? 700 : 600,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '14px', minHeight: 0, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--md-surface-container-low)', minHeight: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--md-outline)', letterSpacing: '0.04em' }}>小时</span>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                  {hours.map((h) => {
                    const active = h === hour;
                    return (
                      <button
                        key={`h-${h}`}
                        type="button"
                        onClick={() => selectTime(h, minute)}
                        style={{
                          height: '42px',
                          border: 'none',
                          borderRadius: '14px',
                          background: active ? 'var(--md-surface-container-highest)' : 'var(--md-surface-container)',
                          color: 'var(--md-on-surface)',
                          fontWeight: active ? 800 : 600,
                          cursor: 'pointer',
                        }}
                      >
                        {h.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--md-surface-container-low)', minHeight: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--md-outline)', letterSpacing: '0.04em' }}>分钟</span>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                  {minutes.map((m) => {
                    const active = m === minute;
                    return (
                      <button
                        key={`m-${m}`}
                        type="button"
                        onClick={() => selectTime(hour, m, true)}
                        style={{
                          height: '42px',
                          border: 'none',
                          borderRadius: '14px',
                          background: active ? 'var(--md-surface-container-highest)' : 'var(--md-surface-container)',
                          color: 'var(--md-on-surface)',
                          fontWeight: active ? 800 : 600,
                          cursor: 'pointer',
                        }}
                      >
                        {m.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {hint && (
        <span style={{ fontSize: '12px', color: 'var(--md-outline)', lineHeight: 1.4 }}>
          {hint}
        </span>
      )}

      <style>{`
        @keyframes pickerPop {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
