import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { IconHome } from '../components/Icons';

type Tab = 'login' | 'register';

export default function Login() {
  const [tab, setTab] = useState<Tab>('login');
  const { login, register } = useAuth();
  const toast = useToast();

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;
    setLoginLoading(true);
    try {
      const result = await login(loginUsername, loginPassword);
      if (result.success) window.location.reload();
      else toast(result.message!, 'error');
    } catch { toast('网络错误', 'error'); }
    setLoginLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) return;
    setLoginLoading(true);
    try {
      const result = await register({
        username: regUsername, email: regEmail,
        password: regPassword, display_name: regDisplayName || undefined,
      });
      if (result.success) {
        toast('注册成功，请登录', 'success');
        setTab('login');
        setRegUsername(''); setRegEmail(''); setRegPassword(''); setRegDisplayName('');
      } else { toast(result.message!, 'error'); }
    } catch { toast('网络错误', 'error'); }
    setLoginLoading(false);
  }

  return (
    <div className="login-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-white/[0.06] rounded-full -top-40 -right-20 blur-[80px]" />
      <div className="absolute w-[350px] h-[350px] bg-white/[0.04] rounded-full -bottom-20 -left-10 blur-[60px]" />

      <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-[92vw] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center pt-10 pb-6 px-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-primary/25">
            <IconHome size={22} />
          </div>
          <h1 className="text-xl font-bold text-text-main">InkForge</h1>
          <p className="text-text-muted text-xs mt-0.5">管理后台</p>
        </div>

        {/* Tabs */}
        <div className="flex mx-8 mb-6 bg-bg-secondary rounded-lg p-1 relative">
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-transform duration-200
            ${tab === 'register' ? 'translate-x-full' : 'translate-x-0'}`} />
          <button onClick={() => setTab('login')}
            className={`flex-1 py-1.5 text-center rounded-md text-sm font-medium transition-colors duration-150 relative z-[1]
              ${tab === 'login' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            登录
          </button>
          <button onClick={() => setTab('register')}
            className={`flex-1 py-1.5 text-center rounded-md text-sm font-medium transition-colors duration-150 relative z-[1]
              ${tab === 'register' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            注册
          </button>
        </div>

        {/* Forms */}
        <div className="px-8 pb-8">
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="用户名" required />
              <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="密码" required />
              <Button type="submit" disabled={loginLoading} loading={loginLoading} className="w-full mt-1">
                登录
              </Button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="用户名" required />
              <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="邮箱" required />
              <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="密码" required />
              <Input type="text" value={regDisplayName} onChange={(e) => setRegDisplayName(e.target.value)} placeholder="昵称（选填）" />
              <Button type="submit" disabled={loginLoading} loading={loginLoading} className="w-full mt-1">
                创建账户
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
