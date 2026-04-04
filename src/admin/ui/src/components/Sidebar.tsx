import { useAuth } from '../contexts/AuthContext';
import {
  IconFileText, IconFolderOpen, IconTag, IconMessageSquare,
  IconUpload, IconSettings, IconUser, IconLogOut,
} from './Icons';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    section: '内容',
    items: [
      { key: 'posts', icon: <IconFileText />, label: '文章' },
      { key: 'categories', icon: <IconFolderOpen />, label: '分类' },
      { key: 'tags', icon: <IconTag />, label: '标签' },
      { key: 'comments', icon: <IconMessageSquare />, label: '评论' },
    ],
  },
  {
    section: '系统',
    items: [
      { key: 'upload', icon: <IconUpload />, label: '上传' },
      { key: 'settings', icon: <IconSettings />, label: '设置' },
    ],
  },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside
      style={{
        width: '224px',
        background: 'var(--sidebar-bg)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── 顶部品牌 ── */}
      <div
        onClick={() => window.open('/', '_blank')}
        style={{
          padding: '20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Logo */}
        <div style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
          background: 'var(--primary-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            InkForge
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '1px' }}>
            管理后台
          </div>
        </div>
      </div>

      {/* ── 导航（设计指南：Ghost 按钮 + 左侧指示条） ── */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {navGroups.map(group => (
          <div key={group.section} style={{ marginBottom: '4px' }}>
            {/* 分组标题 */}
            <div style={{
              padding: '16px 10px 8px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {group.section}
            </div>
            {/* 菜单项 */}
            {group.items.map(item => {
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    /* 激活态：浅色背景 + 左侧指示条（而非整行橙色） */
                    background: isActive ? 'rgba(255,107,53,0.12)' : 'transparent',
                    color: isActive ? 'var(--primary-400)' : 'var(--sidebar-text)',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    marginBottom: '2px',
                    position: 'relative',
                    /* 左侧指示条 — 暗示当前位置 */
                    boxShadow: isActive ? 'none' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      /* Ghost 效果：hover 才显示背景 */
                      e.currentTarget.style.background = 'var(--sidebar-hover)';
                      e.currentTarget.style.color = 'var(--sidebar-text-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--sidebar-text)';
                    }
                  }}
                >
                  {/* 左侧指示条 — 仅激活态显示 */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: '-10px',
                      top: '8px',
                      bottom: '8px',
                      width: '3px',
                      borderRadius: '0 3px 3px 0',
                      background: 'var(--sidebar-indicator)',
                    }} />
                  )}
                  <span style={{ width: '20px', textAlign: 'center', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── 底部用户区 ── */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '4px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,107,53,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--primary-400)',
          }}>
            <IconUser size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.display_name || '管理员'}
            </div>
            <div style={{ fontSize: '11px', color: '#555' }}>{user?.role || 'member'}</div>
          </div>
        </div>
        {/* 退出按钮 — 语义色：红色=危险操作 */}
        <button
          onClick={() => void logout()}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--danger-500)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-50)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <IconLogOut />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
