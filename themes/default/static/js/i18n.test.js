/**
 * Tests for i18n.js - Language switching functionality
 * 
 * These tests verify that the internationalization system works correctly
 * for the login page, including language switching, cookie persistence,
 * and translation updates.
 */

// Mock DOM environment
const { JSDOM } = require('jsdom');

describe('I18n System - Login Page', () => {
  let dom;
  let document;
  let window;
  let I18n;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div class="lang-switcher">
            <button class="lang-btn" data-lang="zh">中</button>
            <button class="lang-btn" data-lang="en">En</button>
          </div>
          <h1 data-i18n="loginTitle">欢迎回来</h1>
          <p data-i18n="loginSubtitle">登录后即可评论、管理个人中心与同步会话。</p>
          <label>
            <span data-i18n="loginLabel">登录名</span>
            <input data-i18n-placeholder="loginPlaceholder" placeholder="用户名或邮箱" />
          </label>
          <label>
            <span data-i18n="passwordLabel">密码</span>
            <input data-i18n-placeholder="passwordPlaceholder" placeholder="请输入密码" />
          </label>
          <button data-i18n="loginButton">登录</button>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;

    // Load i18n.js into the window context
    const i18nCode = require('fs').readFileSync(
      require('path').join(__dirname, 'i18n.js'),
      'utf8'
    );
    const script = document.createElement('script');
    script.textContent = i18nCode;
    document.head.appendChild(script);

    I18n = window.I18n;
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('Initialization', () => {
    test('should initialize with default language (zh)', () => {
      I18n.init();
      expect(I18n.getLang()).toBe('zh');
    });

    test('should initialize with specified language', () => {
      I18n.init('en');
      expect(I18n.getLang()).toBe('en');
    });

    test('should persist language to cookie', () => {
      I18n.init('en');
      expect(document.cookie).toContain('lang=en');
    });
  });

  describe('Language Switching', () => {
    test('should update all elements with data-i18n attribute when switching to English', () => {
      I18n.init('zh');
      const title = document.querySelector('[data-i18n="loginTitle"]');
      expect(title.textContent).toBe('欢迎回来');

      I18n.init('en');
      expect(title.textContent).toBe('Welcome back');
    });

    test('should update all elements with data-i18n attribute when switching to Chinese', () => {
      I18n.init('en');
      const subtitle = document.querySelector('[data-i18n="loginSubtitle"]');
      expect(subtitle.textContent).toBe('Sign in to comment, manage your profile, and sync sessions.');

      I18n.init('zh');
      expect(subtitle.textContent).toBe('登录后即可评论、管理个人中心与同步会话。');
    });

    test('should update placeholder attributes when language changes', () => {
      I18n.init('zh');
      const input = document.querySelector('[data-i18n-placeholder="loginPlaceholder"]');
      expect(input.placeholder).toBe('用户名或邮箱');

      I18n.init('en');
      expect(input.placeholder).toBe('Username or email');
    });

    test('should update all translatable elements simultaneously', () => {
      I18n.init('zh');
      
      const elements = {
        title: document.querySelector('[data-i18n="loginTitle"]'),
        subtitle: document.querySelector('[data-i18n="loginSubtitle"]'),
        loginLabel: document.querySelector('[data-i18n="loginLabel"]'),
        passwordLabel: document.querySelector('[data-i18n="passwordLabel"]'),
        button: document.querySelector('[data-i18n="loginButton"]')
      };

      // Switch to English
      I18n.init('en');

      expect(elements.title.textContent).toBe('Welcome back');
      expect(elements.subtitle.textContent).toBe('Sign in to comment, manage your profile, and sync sessions.');
      expect(elements.loginLabel.textContent).toBe('Username');
      expect(elements.passwordLabel.textContent).toBe('Password');
      expect(elements.button.textContent).toBe('Sign in');
    });
  });

  describe('Language Button State', () => {
    test('should mark active language button with active class', () => {
      I18n.init('zh');
      const zhBtn = document.querySelector('[data-lang="zh"]');
      const enBtn = document.querySelector('[data-lang="en"]');

      expect(zhBtn.classList.contains('active')).toBe(true);
      expect(enBtn.classList.contains('active')).toBe(false);
    });

    test('should update active class when language changes', () => {
      I18n.init('zh');
      const zhBtn = document.querySelector('[data-lang="zh"]');
      const enBtn = document.querySelector('[data-lang="en"]');

      I18n.init('en');

      expect(zhBtn.classList.contains('active')).toBe(false);
      expect(enBtn.classList.contains('active')).toBe(true);
    });
  });

  describe('Translation Function', () => {
    test('should return correct translation for given key', () => {
      I18n.init('zh');
      expect(I18n.t('loginTitle')).toBe('欢迎回来');

      I18n.init('en');
      expect(I18n.t('loginTitle')).toBe('Welcome back');
    });

    test('should return fallback when key not found', () => {
      I18n.init('zh');
      expect(I18n.t('nonexistentKey', 'Fallback Text')).toBe('Fallback Text');
    });

    test('should return key when no translation and no fallback', () => {
      I18n.init('zh');
      expect(I18n.t('nonexistentKey')).toBe('nonexistentKey');
    });
  });

  describe('Cookie Persistence', () => {
    test('should save language preference to cookie', () => {
      I18n.init('en');
      expect(document.cookie).toContain('lang=en');
    });

    test('should load language from cookie on initialization', () => {
      // Set cookie manually
      document.cookie = 'lang=en; path=/';
      
      // Initialize without specifying language
      I18n.init();
      
      expect(I18n.getLang()).toBe('en');
    });
  });
});
