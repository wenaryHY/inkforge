import { useEffect, useMemo, useRef, useState } from 'react';
import { IconClock } from './Icons';

interface NumberWheelPickerProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}

const quickDayOptions = [7, 30, 60, 90];

export function NumberWheelPicker({ value, min, max, onChange, suffix = '' }: NumberWheelPickerProps) {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 340 });
  const [inputValue, setInputValue] = useState(String(value));

  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const numbers = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);
  const quickOptions = useMemo(() => quickDayOptions.filter((num) => num >= min && num <= max), [min, max]);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const updatePopupPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const panelWidth = Math.min(400, Math.max(340, rect.width));
    const panelHeight = 388;
    const maxLeft = Math.max(8, window.innerWidth - panelWidth - 8);
    const left = Math.min(Math.max(8, rect.left), maxLeft);
    const preferTop = rect.bottom + 10;
    const top = preferTop + panelHeight > window.innerHeight - 8
      ? Math.max(8, rect.top - panelHeight - 10)
      : preferTop;
    setPopupPos({ top, left, width: panelWidth });
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

  const commitInput = () => {
    const num = Number.parseInt(inputValue, 10);
    if (Number.isNaN(num)) {
      setInputValue(String(value));
      return;
    }
    const next = clamp(num);
    onChange(next);
    setInputValue(String(next));
  };

  const selectValue = (next: number) => {
    onChange(next);
    setInputValue(String(next));
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={(e) => {
              commitInput();
              e.currentTarget.style.boxShadow = open ? '0 0 0 2px var(--md-primary)' : 'none';
              e.currentTarget.style.background = open ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--md-primary)';
              e.currentTarget.style.background = 'var(--md-surface-container-lowest)';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitInput();
                setOpen(false);
              }
            }}
            style={{
              width: '100%',
              height: '48px',
              padding: '0 48px 0 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: open ? 'var(--md-surface-container-lowest)' : 'var(--md-surface-container-low)',
              color: 'var(--md-on-surface)',
              fontSize: '16px',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: open ? '0 0 0 2px var(--md-primary)' : 'none',
              transition: 'background var(--transition-normal), box-shadow var(--transition-normal)',
            }}
          />
          {suffix && (
            <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--md-outline)' }}>
              {suffix}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="打开天数选择面板"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: open ? 'var(--md-surface-container-highest)' : 'var(--md-surface-container-low)',
            color: open ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background var(--transition-normal), color var(--transition-normal), transform var(--transition-normal)',
            boxShadow: open ? '0 0 0 2px var(--md-primary)' : 'none',
          }}
        >
          <IconClock size={16} />
        </button>
      </div>

      {open && (
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: popupPos.top,
            left: popupPos.left,
            width: popupPos.width,
            maxHeight: '388px',
            background: 'var(--md-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--elevation-2)',
            zIndex: 9999,
            padding: '16px',
            animation: 'pickerPop 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--md-outline)' }}>
              回收站策略
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--md-on-surface)' }}>{value}{suffix}</span>
              <span style={{ fontSize: '12px', color: 'var(--md-on-surface-variant)' }}>支持 {min}–{max}{suffix}，过期后自动永久清理</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {quickOptions.map((num) => {
              const active = num === value;
              return (
                <button
                  key={`quick-${num}`}
                  type="button"
                  onClick={() => selectValue(num)}
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
                  {num}{suffix}
                </button>
              );
            })}
          </div>

          <div
            style={{
              overflowY: 'auto',
              maxHeight: '236px',
              paddingRight: '4px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                gap: '8px',
              }}
            >
              {numbers.map((num) => {
                const active = num === value;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => selectValue(num)}
                    style={{
                      height: '42px',
                      border: 'none',
                      borderRadius: '14px',
                      background: active ? 'var(--md-surface-container-highest)' : 'var(--md-surface-container-low)',
                      color: active ? 'var(--md-on-surface)' : 'var(--md-on-surface)',
                      fontWeight: active ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast), background var(--transition-fast)',
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
