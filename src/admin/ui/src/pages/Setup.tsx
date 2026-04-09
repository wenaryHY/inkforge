import { useEffect, useMemo, useState } from 'react';
import { apiData, API_PREFIX, setToken } from '../lib/api';
import type { SetupInitializeResponse, SetupStatusResponse } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useI18n } from '../i18n';

interface FormState {
  site_title: string;
  site_description: string;
  site_url: string;
  admin_url: string;
  allow_register: boolean;
  username: string;
  email: string;
  password: string;
  display_name: string;
}

const cardStyle: React.CSSProperties = {
  width: 'min(960px, 100%)',
  background: 'rgba(255,255,255,0.82)',
  borderRadius: '32px',
  boxShadow: '0 28px 80px rgba(15, 23, 42, 0.12)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.7)',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 1,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 15px',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'rgba(255,255,255,0.92)',
  fontSize: '14px',
  color: 'var(--md-on-surface)',
  outline: 'none',
  boxSizing: 'border-box',
};

function deriveAdminUrl(siteUrl: string): string {
  const trimmed = siteUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return `${parsed.origin}/admin`;
  } catch {
    return '';
  }
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--md-on-surface)' }}>{label}</span>
      {children}
      {hint ? <span style={{ fontSize: '12px', color: 'var(--md-outline)' }}>{hint}</span> : null}
    </label>
  );
}

export default function Setup() {
  const toast = useToast();
  const { lang, setLang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState('/admin');
  const [form, setForm] = useState<FormState>({

    site_title: 'InkForge',
    site_description: '',
    site_url: '',
    admin_url: '',
    allow_register: true,
    username: '',
    email: '',
    password: '',
    display_name: '',
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const status = await apiData<SetupStatusResponse>(`${API_PREFIX}/setup/status`);
        if (!active) return;
        if (status.installed) {
          window.location.replace(status.admin_url || '/admin');
          return;
        }
        setForm((prev) => ({
          ...prev,
          site_title: status.site_title || prev.site_title,
          site_description: status.site_description || '',
          site_url: status.site_url || '',
          admin_url: status.admin_url || deriveAdminUrl(status.site_url || ''),
          allow_register: status.allow_register,
        }));
      } catch (error) {
        toast(error instanceof Error ? error.message : '加载安装向导失败', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [toast]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.site_title.trim() &&
      form.site_url.trim() &&
      form.admin_url.trim() &&
      form.username.trim() &&
      form.email.trim() &&
      form.password.trim(),
    );
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSiteUrlChange(value: string) {
    setForm((prev) => {
      const nextSiteUrl = value;
      const derivedCurrent = deriveAdminUrl(prev.site_url);
      const shouldFollow = !prev.admin_url || prev.admin_url === derivedCurrent;
      return {
        ...prev,
        site_url: nextSiteUrl,
        admin_url: shouldFollow ? deriveAdminUrl(nextSiteUrl) : prev.admin_url,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload = await apiData<SetupInitializeResponse>(`${API_PREFIX}/setup/initialize`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const nextTarget = payload.redirect_to || '/admin';
      setToken(payload.token);
      setRedirectTarget(nextTarget);
      setCompleted(true);
      toast('安装完成，正在进入后台…', 'success');
      window.setTimeout(() => {
        window.location.href = nextTarget;
      }, 900);

    } catch (error) {
      toast(error instanceof Error ? error.message : '安装失败', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--md-background)' }}>
        <div style={{ fontSize: '14px', color: 'var(--md-outline)' }}>正在检查安装状态…</div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, rgba(249,115,22,0.10) 0%, rgba(255,255,255,0.92) 28%, var(--md-background) 100%)', padding: '24px' }}>
        <div style={{ ...cardStyle, maxWidth: '560px' }}>
          <div style={{ padding: '48px 42px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', margin: '0 auto 18px', borderRadius: '24px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, var(--md-primary), #fb923c)', color: '#fff', fontSize: '30px', fontWeight: 800 }}>✓</div>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--md-on-surface)' }}>安装完成</h2>
            <p style={{ margin: '12px 0 0', fontSize: '14px', lineHeight: 1.75, color: 'var(--md-outline)' }}>首个管理员已创建，运行时配置也已刷新。系统会自动跳转到你刚设置的后台入口。</p>
            <div style={{ marginTop: '18px', fontSize: '13px', color: 'var(--md-on-surface)', wordBreak: 'break-all' }}>{redirectTarget}</div>
            <button
              type="button"
              onClick={() => { window.location.href = redirectTarget; }}
              style={{ marginTop: '28px', border: 'none', borderRadius: '999px', background: 'linear-gradient(135deg, var(--md-primary), #fb923c)', color: '#fff', fontSize: '14px', fontWeight: 800, padding: '14px 24px', cursor: 'pointer', boxShadow: '0 18px 36px rgba(249,115,22,0.28)' }}
            >
              立即进入后台
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(249,115,22,0.10) 0%, rgba(255,255,255,0.92) 28%, var(--md-background) 100%)',
      padding: '32px 20px 48px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-120px', left: '-90px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.20) 0%, transparent 72%)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 74%)' }} />
      </div>

      <div style={cardStyle}>
        <div style={{
          padding: '40px 36px 34px',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.98) 0%, rgba(251,146,60,0.95) 100%)',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.16)', fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
                InkForge Setup
              </div>
              <h1 style={{ margin: 0, fontSize: '32px', lineHeight: 1.1, fontWeight: 800 }}>完成首次安装</h1>
              <p style={{ margin: '10px 0 0', maxWidth: '520px', fontSize: '14px', lineHeight: 1.75, color: 'rgba(255,255,255,0.86)' }}>
                先配置前台公开地址和后台入口，再创建首个管理员。安装完成后，系统会自动进入你刚设置的后台地址。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.14)', padding: '4px', borderRadius: '999px' }}>
              {(['zh', 'en'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLang(value)}
                  style={{
                    border: 'none',
                    background: lang === value ? '#fff' : 'transparent',
                    color: lang === value ? 'var(--md-primary)' : '#fff',
                    borderRadius: '999px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {value === 'zh' ? '中文' : 'EN'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px 32px 34px', display: 'grid', gap: '24px' }}>
          <section style={{ display: 'grid', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--md-on-surface)' }}>1. 站点入口</h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--md-outline)', lineHeight: 1.7 }}>前台公开地址必须是纯 origin；后台入口必须是完整 URL，且路径固定为 `/admin`。</p>
            </div>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <Field label="站点标题">
                <input value={form.site_title} onChange={(e) => update('site_title', e.target.value)} style={inputStyle} placeholder="InkForge" />
              </Field>
              <Field label="公开站点 URL" hint="例如 http://localhost:2000 或 https://www.example.com">
                <input value={form.site_url} onChange={(e) => handleSiteUrlChange(e.target.value)} style={inputStyle} placeholder="http://localhost:2000" />
              </Field>
              <Field label="后台入口 URL" hint="必须是完整后台入口，例如 http://localhost:5173/admin">
                <input value={form.admin_url} onChange={(e) => update('admin_url', e.target.value)} style={inputStyle} placeholder="http://localhost:5173/admin" />
              </Field>
              <Field label="公开注册">
                <select value={form.allow_register ? 'true' : 'false'} onChange={(e) => update('allow_register', e.target.value === 'true')} style={inputStyle}>
                  <option value="true">允许安装后公开注册</option>
                  <option value="false">安装后默认关闭注册</option>
                </select>
              </Field>
            </div>
            <Field label="站点描述" hint="用于 SEO 与首页摘要展示，可留空。">
              <textarea value={form.site_description} onChange={(e) => update('site_description', e.target.value)} style={{ ...inputStyle, minHeight: '108px', resize: 'vertical' }} placeholder="A personal blog powered by InkForge" />
            </Field>
          </section>

          <section style={{ display: 'grid', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--md-on-surface)' }}>2. 初始管理员</h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--md-outline)', lineHeight: 1.7 }}>这个账号会在安装完成后立即登录，用于进入后台继续管理站点。</p>
            </div>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Field label="用户名">
                <input value={form.username} onChange={(e) => update('username', e.target.value)} style={inputStyle} placeholder="admin" />
              </Field>
              <Field label="邮箱">
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} style={inputStyle} placeholder="admin@example.com" />
              </Field>
              <Field label="显示名称" hint="留空时默认使用用户名。">
                <input value={form.display_name} onChange={(e) => update('display_name', e.target.value)} style={inputStyle} placeholder="管理员" />
              </Field>
              <Field label="密码" hint="至少 6 个字符。">
                <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} style={inputStyle} placeholder="******" />
              </Field>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--md-outline)', lineHeight: 1.7 }}>
              提交后会把安装阶段推进到 `completed`、创建首个管理员，并把会话直接切到新后台入口。

            </span>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              style={{
                minWidth: '190px',
                border: 'none',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, var(--md-primary), #fb923c)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                padding: '14px 22px',
                cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
                opacity: !canSubmit || submitting ? 0.6 : 1,
                boxShadow: '0 18px 36px rgba(249,115,22,0.28)',
              }}
            >
              {submitting ? '正在安装…' : '完成安装并进入后台'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
