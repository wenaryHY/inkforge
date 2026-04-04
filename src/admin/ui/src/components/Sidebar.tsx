import { useAuth } from '../contexts/AuthContext';
import {
  IconFileText, IconFolderOpen, IconTag, IconMessageSquare,
  IconUpload, IconSettings, IconUser, IconLogOut, IconHome,
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
    section: '����',
    items: [
      { key: 'posts', icon: <IconFileText />, label: '����' },
      { key: 'categories', icon: <IconFolderOpen />, label: '����' },
      { key: 'tags', icon: <IconTag />, label: '��ǩ' },
      { key: 'comments', icon: <IconMessageSquare />, label: '����' },
    ],
  },
  {
    section: 'ϵͳ',
    items: [
      { key: 'upload', icon: <IconUpload />, label: 'ý��' },
      { key: 'settings', icon: <IconSettings />, label: '����' },
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
    <aside className="w-60 bg-sidebar text-white flex flex-col flex-shrink-0 relative z-10">
      <div className="absolute top-0 right-0 w-px h-full bg-white/5" />

      <div
        className="px-5 py-5 border-b border-white/5 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-white/10 group"
        onClick={() => window.open('/', '_blank')}
        title="������ҳ"
      >
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary via-primary to-violet-500 flex items-center justify-center text-base flex-shrink-0 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-200">
          <IconHome size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-tight tracking-tight">InkForge</span>
          <span className="text-[11px] text-sidebar-text font-normal">v0.2.0</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group) => (
          <div key={group.section}>
            <div className="px-3 pt-5 pb-1.5 text-[11px] font-semibold text-white/30 uppercase tracking-wider">
              {group.section}
            </div>
            {group.items.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 cursor-pointer transition-all duration-200
                  ${activePage === item.key
                    ? 'text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)]'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white/90'
                  }`}
                style={activePage === item.key ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(129,140,248,0.85))' } : undefined}
              >
                <span className="w-5 text-center flex-shrink-0 transition-transform duration-200">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-violet-500/80 flex items-center justify-center flex-shrink-0 shadow-md">
            <IconUser size={15} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white/90 truncate">{user?.display_name || '����Ա'}</span>
            <span className="text-[11px] text-sidebar-text">{user?.role || 'member'}</span>
          </div>
        </div>
        <button
          onClick={() => void logout()}
          className="w-full bg-transparent text-sidebar-text border-none px-3 py-2 rounded-lg cursor-pointer font-medium text-xs flex items-center gap-2 transition-all duration-200 hover:bg-red-500/15 text-red-400 hover:text-red-300"
        >
          <IconLogOut />
          <span>�˳���¼</span>
        </button>
      </div>
    </aside>
  );
}
