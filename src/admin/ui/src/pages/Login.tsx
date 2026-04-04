import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

type Tab = 'login' | 'register';

export default function Login() {
  const [tab, setTab] = useState<Tab>('login');
  const { login, register } = useAuth();
  const toast = useToast();

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
        window.location.reload();
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
        window.location.reload();
      } else {
        toast(result.message || '注册失败', 'error');
      }
    } finally {
      setLoginLoading(false);
    }
  }

  // ── 内联输入框样式（登录页专用，更粗更大）───
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    padding: '0 18px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#1f2937',
    background: '#ffffff',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
  };

  // 按钮样式
  const btnStyle: React.CSSProperties = {
    width: '100%',
    height: '50px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #e55a28 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8f9fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif",
        padding: '20px',
      }}
    >
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* 主装饰圆 */}
        <div style={{
          position: 'absolute', top: '-140px', right: '-100px',
          width: '520px', height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.10) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-120px', left: '-80px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.07) 0%, transparent 70%)',
        }} />
        {/* 小点缀 */}
        {[{ t: '18%', l: '10%', s: 8, c: '#ff6b35', o: 0.3 },
          { t: '65%', r: '15%', s: 6, c: '#4ecdc4', o: 0.45 },
          { t: '40%', r: '8%', s: 5, c: '#ff6b35', o: 0.2 },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: d.t,
            ...(d.l ? { left: d.l } : { right: d.r }),
            width: `${d.s}px`,
            height: `${d.s}px`,
            borderRadius: '50%',
            background: d.c,
            opacity: d.o,
          }} />
        ))}
      </div>

      {/* 登录卡片 */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04)',
          width: '420px',
          maxWidth: '100%',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* 顶部品牌区 */}
        <div style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 50%, #ffa06a 100%)',
          padding: '42px 36px 36px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 装饰圆 */}
          <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ position: 'absolute', bottom: '-25px', left: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

          {/* Logo */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.95"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
            </svg>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>InkForge</h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', marginTop: '6px', letterSpacing: '0.2px' }}>博客管理后台</p>
        </div>

        {/* Tab 切换 */}
        <div style={{
          display: 'flex', margin: '28px 32px 0',
          background: '#f3f4f6', borderRadius: '12px', padding: '4px', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: '4px', left: '4px',
            width: 'calc(50% - 4px)', height: 'calc(100% - 8px)',
            borderRadius: '9px',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
            transform: tab === 'login' ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '11px', textAlign: 'center',
                fontSize: '14.5px', fontWeight: 700,
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: tab === t ? '#ff6b35' : '#9ca3af',
                transition: 'color 0.2s', position: 'relative', zIndex: 1,
              }}
            >
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        {/* 表单区域 */}
        <div style={{ padding: '26px 32px 0' }}>
          {tab === 'login' && (
            <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <input
                type="text"
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                placeholder="用户名或邮箱"
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; e.target.style.boxShadow = '0 0 0 4px rgba(255,107,53,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="密码"
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; e.target.style.boxShadow = '0 0 0 4px rgba(255,107,53,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  ...btnStyle,
                  opacity: loginLoading ? 0.75 : 1,
                  cursor: loginLoading ? 'not-allowed' : 'pointer',
                  transform: !loginLoading ? undefined : 'scale(0.99)',
                }}
                onMouseEnter={(e) => { if (!loginLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.4)'; } }}
                onMouseLeave={(e) => { if (!loginLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; } }}
              >
                {loginLoading ? '正在登录...' : '登 录'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                placeholder="用户名"
                required
                style={{ ...inputStyle, height: '44px', fontSize: '14px' }}
                onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; e.target.style.boxShadow = '0 0 0 4px rgba(255,107,53,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
              <input
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="邮箱地址"
                required
                style={{ ...inputStyle, height: '44px', fontSize: '14px' }}
                onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; e.target.style.boxShadow = '0 0 0 4px rgba(255,107,53,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
              <input
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="密码"
                required
                style={{ ...inputStyle, height: '44px', fontSize: '14px' }}
                onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; e.target.style.boxShadow = '0 0 0 4px rgba(255,107,53,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
              <input
                type="text"
                value={regDisplayName}
                onChange={e => setRegDisplayName(e.target.value)}
                placeholder="显示名称（选填）"
                style={{ ...inputStyle, height: '44px', fontSize: '14px' }}
                onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; e.target.style.boxShadow = '0 0 0 4px rgba(255,107,53,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  ...btnStyle,
                  height: '48px', fontSize: '15px',
                  opacity: loginLoading ? 0.75 : 1,
                  cursor: loginLoading ? 'not-allowed' : 'pointer',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => { if (!loginLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.4)'; } }}
                onMouseLeave={(e) => { if (!loginLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; } }}
              >
                {loginLoading ? '创建中...' : '创建账户'}
              </button>
            </form>
          )}
        </div>

        {/* 底部 */}
        <div style={{ textAlign: 'center', paddingTop: '22px', paddingBottom: '32px' }}>
          <a href="/" style={{ fontSize: '13.5px', color: '#9ca3af', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' }}
             onMouseEnter={e => e.currentTarget.style.color = '#ff6b35'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
