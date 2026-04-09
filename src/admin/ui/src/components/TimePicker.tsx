import { useState, useRef, useEffect } from 'react';
import { IconClock } from './Icons';

interface TimePickerProps {
  label?: string;
  hint?: string;
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}

export function TimePicker({ label, hint, hour, minute, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Auto-scroll to selected value when opened
  useEffect(() => {
    if (open) {
      if (hourRef.current) {
        const selectedHour = hourRef.current.querySelector('[data-selected="true"]');
        if (selectedHour) {
          selectedHour.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
      if (minuteRef.current) {
        const selectedMinute = minuteRef.current.querySelector('[data-selected="true"]');
        if (selectedMinute) {
          selectedMinute.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
    }
  }, [open, hour, minute]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} ref={containerRef}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--md-on-surface-variant)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--md-surface-container-low)',
            color: 'var(--md-on-surface)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: open ? '2px solid var(--md-primary)' : 'none',
            outlineOffset: open ? '-2px' : '0',
          }}
        >
          <IconClock size={16} />
          {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: '240px',
              height: '240px',
              background: 'var(--md-surface-container-lowest)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--elevation-2)',
              zIndex: 100,
              display: 'flex',
              overflow: 'hidden',
              animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Hour Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--md-outline)', borderBottom: 'none', background: 'var(--md-surface-container-low)' }}>
                小时
              </div>
              <div ref={hourRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0', scrollBehavior: 'smooth' }} className="hide-scrollbar">
                {hours.map((h) => (
                  <div
                    key={`h-${h}`}
                    data-selected={h === hour}
                    onClick={() => onChange(h, minute)}
                    style={{
                      padding: '8px 0',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: h === hour ? 700 : 400,
                      color: h === hour ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                      background: h === hour ? 'var(--md-primary-container)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (h !== hour) e.currentTarget.style.background = 'var(--md-surface-container)'; }}
                    onMouseLeave={(e) => { if (h !== hour) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {h.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Minute Column - use tonal background for visual separation instead of border */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--md-surface-container)' }}>
              <div style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--md-outline)', borderBottom: 'none', background: 'var(--md-surface-container-low)' }}>
                分钟
              </div>
              <div ref={minuteRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0', scrollBehavior: 'smooth' }} className="hide-scrollbar">
                {minutes.map((m) => (
                  <div
                    key={`m-${m}`}
                    data-selected={m === minute}
                    onClick={() => onChange(hour, m)}
                    style={{
                      padding: '8px 0',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: m === minute ? 700 : 400,
                      color: m === minute ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                      background: m === minute ? 'var(--md-primary-container)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (m !== minute) e.currentTarget.style.background = 'var(--md-surface-container)'; }}
                    onMouseLeave={(e) => { if (m !== minute) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {m.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selection overlay (just visual) */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '36px', marginTop: '-18px', borderTop: 'none', borderBottom: 'none', pointerEvents: 'none', background: 'rgba(0,0,0,0.02)' }} />
          </div>
        )}
      </div>
      {hint && (
        <span style={{ fontSize: '12px', color: 'var(--md-outline)', lineHeight: 1.4 }}>
          {hint}
        </span>
      )}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
