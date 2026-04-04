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
        background: '#1c1c1e',
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
      {/* 顶部品牌 */}
      <div
        onClick={() => window.open('/', '_blank')}
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Logo 圆 */}
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a4c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.2px' }}>
            InkForge
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '1px' }}>
            管理后台
          </div>
        </div>
      </div>

      {/* 导航 */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navGroups.map(group => (
          <div key={group.section} style={{ marginBottom: '4px' }}>
            {/* 分组标题 */}
            <div style={{
              padding: '14px 10px 6px',
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
                    padding: '10px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, rgba(255,107,53,0.9), rgba(255,138,76,0.85))' : 'transparent',
                    color: isActive ? '#ffffff' : '#888',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    marginBottom: '2px',
                    boxShadow: isActive ? '0 4px 12px rgba(255,107,53,0.3)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = '#ddd';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#888';
                    }
                  }}
                >
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

      {/* 底部用户区 */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '4px' }}>
          <div
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.6), rgba(255,138,76,0.5))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconUser size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.display_name || '管理员'}
            </div>
            <div style={{ fontSize: '11px', color: '#555' }}>{user?.role || 'member'}</div>
          </div>
        </div>
        <button
          onClick={() => void logout()}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#e05252',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
            textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,50,50,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <IconLogOut />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
