import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7f7f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif",
      }}
    >
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* 顶部大圆形装饰 */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '480px', height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)',
        }} />
        {/* 左下圆形 */}
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '360px', height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.06) 0%, transparent 70%)',
        }} />
        {/* 小圆点缀 */}
        <div style={{
          position: 'absolute', top: '25%', left: '8%',
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#ff6b35', opacity: 0.4,
        }} />
        <div style={{
          position: 'absolute', top: '60%', right: '12%',
          width: '4px', height: '4px', borderRadius: '50%',
          background: '#4ecdc4', opacity: 0.5,
        }} />
      </div>

      {/* 登录卡片 */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          width: '400px',
          maxWidth: '92vw',
          padding: '0 0 32px 0',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* 顶部品牌区 */}
        <div style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a4c 100%)',
          padding: '32px 32px 28px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 背景圆 */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20px', left: '20px',
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />

          {/* Logo 圆 */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '22px',
            backdropFilter: 'blur(4px)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            </svg>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
            InkForge
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '4px' }}>
            博客管理后台
          </p>
        </div>

        {/* Tab 切换 */}
        <div style={{
          display: 'flex',
          margin: '24px 32px 0',
          background: '#f5f5f5',
          borderRadius: '10px',
          padding: '3px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: '3px',
            width: 'calc(50% - 3px)',
            height: 'calc(100% - 6px)',
            borderRadius: '7px',
            background: '#ffffff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            transform: tab === 'login' ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px', textAlign: 'center',
                fontSize: '14px', fontWeight: 600,
                border: 'none', background: 'transparent',
                cursor: 'pointer',
                color: tab === t ? '#ff6b35' : '#999',
                transition: 'color 0.2s',
                position: 'relative', zIndex: 1,
              }}
            >
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        {/* 表单 */}
        <div style={{ padding: '24px 32px 0' }}>
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                type="text"
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                placeholder="用户名或邮箱"
                required
              />
              <Input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="密码"
                required
              />
              <Button type="submit" disabled={loginLoading} loading={loginLoading} style={{ marginTop: '4px' }}>
                登录
              </Button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                type="text"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                placeholder="用户名"
                required
              />
              <Input
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="邮箱"
                required
              />
              <Input
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="密码"
                required
              />
              <Input
                type="text"
                value={regDisplayName}
                onChange={e => setRegDisplayName(e.target.value)}
                placeholder="显示名称（选填）"
              />
              <Button type="submit" disabled={loginLoading} loading={loginLoading} style={{ marginTop: '4px' }}>
                创建账户
              </Button>
            </form>
          )}
        </div>

        {/* 底部返回首页 */}
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '0 32px' }}>
          <a
            href="/"
            style={{
              fontSize: '13px',
              color: '#999',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
