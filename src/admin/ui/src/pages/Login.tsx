import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useI18n } from '../i18n';

type Tab = 'login' | 'register';

export default function Login() {
  const [tab, setTab] = useState<Tab>('login');
  const { login, register } = useAuth();
  const toast = useToast();
  const { t, lang, setLang } = useI18n();

  const [loginValue, setLoginValue] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginValue || !loginPassword) return;
    setLoginLoading(true);
    try {
      const result = await login(loginValue, loginPassword);
      if (result.success) {
        // 延迟刷新确保 token 已写入 localStorage
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast(result.message || '登录失败', 'error');
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) return;
    setLoginLoading(true);
    try {
      const result = await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        display_name: regDisplayName || undefined,
      });
      if (result.success) {
        toast('注册成功，将自动跳转登录', 'success');
        // 延迟刷新确保 token 已写入 localStorage
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast(result.message || '注册失败', 'error');
      }
    } finally {
      setLoginLoading(false);
    }
  }

  /* ── 设计指南：输入框高度 48px，聚焦橙色边框+柔和光晕 ── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    padding: '0 16px',
    border: '1.5px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
  };

  const inputSmallStyle: React.CSSProperties = {
    ...inputStyle,
    height: '44px',
    fontSize: '13px',
  };

  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--primary-500)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-100)';
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-default)';
    e.currentTarget.style.boxShadow = 'none';
  };

  /* ── 设计指南：按钮 hover 上浮 + active 按压微交互 ── */
  const primaryBtnStyle = (loading: boolean, small = false): React.CSSProperties => ({
    width: '100%',
    height: small ? '44px' : '48px',
    background: loading ? 'var(--primary-300)' : 'var(--primary-500)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: small ? '14px' : '15px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.02em',
  });

  const btnHover = (e: React.MouseEvent<HTMLButtonElement>, loading: boolean) => {
    if (loading) return;
    e.currentTarget.style.background = 'var(--primary-600)';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.25)';
  };
  const btnLeave = (e: React.MouseEvent<HTMLButtonElement>, loading: boolean) => {
    if (loading) return;
    e.currentTarget.style.background = 'var(--primary-500)';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };
  const btnDown = (e: React.MouseEvent<HTMLButtonElement>, loading: boolean) => {
    if (loading) return;
    e.currentTarget.style.transform = 'scale(0.98)';
  };
  const btnUp = (e: React.MouseEvent<HTMLButtonElement>, loading: boolean) => {
    if (loading) return;
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif",
        padding: '24px',
      }}
    >
      {/* 设计指南：背景装饰 — 极淡的渐变圆，营造氛围但不喧宾夺主 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '480px', height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '360px', height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.04) 0%, transparent 70%)',
        }} />
      </div>

      {/* 语言切换 — 右上角 */}
      <div style={{
        position: 'fixed', top: '20px', right: '20px',
        display: 'flex', gap: '4px',
        background: 'var(--bg-card)', padding: '4px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--elevation-1)',
        zIndex: 100,
      }}>
        {(['zh', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: lang === l ? 'var(--primary-500)' : 'transparent',
              color: lang === l ? '#fff' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: lang === l ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {l === 'zh' ? '中文' : 'English'}
          </button>
        ))}
      </div>

      {/* 登录卡片 — elevation-2（独立卡片，略强于列表卡片） */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--elevation-2)',
          width: '420px',
          maxWidth: '100%',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* 设计指南：遮罩/覆盖层 — 线性渐变品牌区 */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-400) 60%, var(--primary-300) 100%)',
          padding: '40px 32px 36px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 装饰 — 营造深度但克制 */}
          <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-25px', left: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          {/* Logo — 磨砂玻璃效果 */}
          <div style={{
            width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.95"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            </svg>
          </div>
          {/* 设计指南：标题字母间距收紧 2%~3%，行高 110%~120% */}
          <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', lineHeight: 1.15 }}>{t('title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>{t('subtitle')}</p>
        </div>

        {/* 设计指南：Tab 切换 — 容器框暗示关联性，被框住的 tab 暗示选中 */}
        <div style={{
          display: 'flex', margin: '24px 28px 0',
          background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '4px', position: 'relative',
        }}>
          {/* 滑块指示器 — 暗示当前选中的 tab */}
          <div style={{
            position: 'absolute', top: '4px', left: '4px',
            width: 'calc(50% - 4px)', height: 'calc(100% - 8px)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--elevation-1)',
            transform: tab === 'login' ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
          {(['login', 'register'] as Tab[]).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              style={{
                flex: 1, padding: '10px', textAlign: 'center',
                fontSize: '14px', fontWeight: 600,
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: tab === tabKey ? 'var(--primary-500)' : 'var(--text-muted)',
                transition: 'color 0.2s', position: 'relative', zIndex: 1,
              }}
            >
              {t(tabKey)}
            </button>
          ))}
        </div>

        {/* 表单区域 — 间距 8px 网格 */}
        <div style={{ padding: '24px 28px 0' }}>
          {tab === 'login' && (
            <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" value={loginValue} onChange={e => setLoginValue(e.target.value)}
                placeholder={t('usernameOrEmail')} required style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                placeholder={t('password')} required style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              {/* 设计指南：实心按钮 + hover 上浮 + active 按压反馈 */}
              <button
                type="submit"
                disabled={loginLoading}
                style={primaryBtnStyle(loginLoading)}
                onMouseEnter={e => btnHover(e, loginLoading)}
                onMouseLeave={e => btnLeave(e, loginLoading)}
                onMouseDown={e => btnDown(e, loginLoading)}
                onMouseUp={e => btnUp(e, loginLoading)}
              >
                {loginLoading ? t('loggingIn') : t('loginBtn')}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)}
                placeholder={t('username')} required style={inputSmallStyle} onFocus={focusIn} onBlur={focusOut} />
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                placeholder={t('email')} required style={inputSmallStyle} onFocus={focusIn} onBlur={focusOut} />
              <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                placeholder={t('password')} required style={inputSmallStyle} onFocus={focusIn} onBlur={focusOut} />
              <input type="text" value={regDisplayName} onChange={e => setRegDisplayName(e.target.value)}
                placeholder={t('displayName')} style={inputSmallStyle} onFocus={focusIn} onBlur={focusOut} />
              <button
                type="submit"
                disabled={loginLoading}
                style={{ ...primaryBtnStyle(loginLoading, true), marginTop: '4px' }}
                onMouseEnter={e => btnHover(e, loginLoading)}
                onMouseLeave={e => btnLeave(e, loginLoading)}
                onMouseDown={e => btnDown(e, loginLoading)}
                onMouseUp={e => btnUp(e, loginLoading)}
              >
                {loginLoading ? t('creating') : t('registerBtn')}
              </button>
            </form>
          )}
        </div>

        {/* 设计指南：语义色 — 蓝色=可点击链接 */}
        <div style={{ textAlign: 'center', paddingTop: '20px', paddingBottom: '28px' }}>
          <a href="/"
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ← {t('backToHome')}
          </a>
        </div>
      </div>
    </div>
  );
}
