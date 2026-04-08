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
  // Options for minutes, step by 5 or 1 (we provide all 60 but maybe step 5 is better? The user didn't specify, let's do all 60)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} ref={containerRef}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
            borderRadius: '10px',
            border: `1.5px solid ${open ? 'var(--primary-500)' : 'var(--border-default)'}`,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: open ? '0 0 0 3px rgba(255, 107, 53, 0.1)' : 'none',
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
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              boxShadow: '0 10px 32px rgba(0,0,0,0.1)',
              zIndex: 100,
              display: 'flex',
              overflow: 'hidden',
              animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Hour Column */}
            <div style={{ flex: 1, borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)' }}>
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
                      color: h === hour ? 'var(--primary-600)' : 'var(--text-secondary)',
                      background: h === hour ? 'var(--primary-50)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (h !== hour) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                    onMouseLeave={(e) => { if (h !== hour) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {h.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Minute Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)' }}>
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
                      color: m === minute ? 'var(--primary-600)' : 'var(--text-secondary)',
                      background: m === minute ? 'var(--primary-50)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (m !== minute) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                    onMouseLeave={(e) => { if (m !== minute) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {m.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selection overlay (just visual) */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '36px', marginTop: '-18px', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)', pointerEvents: 'none', background: 'rgba(0,0,0,0.02)' }} />
          </div>
        )}
      </div>
      {hint && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
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
