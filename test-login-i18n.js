/**
 * Automated test script for login page i18n functionality
 * Run with: node test-login-i18n.js
 */

const fs = require('fs');
const path = require('path');

// Simple test framework
let passCount = 0;
let failCount = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passCount++;
    results.push({ name, status: 'PASS', error: null });
    console.log(`✓ ${name}`);
  } catch (error) {
    failCount++;
    results.push({ name, status: 'FAIL', error: error.message });
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Values not equal'}: expected "${expected}", got "${actual}"`);
  }
}

// Mock DOM environment
class MockClassList {
  constructor() {
    this.classes = new Set();
  }

  add(className) {
    this.classes.add(className);
  }

  remove(className) {
    this.classes.delete(className);
  }

  contains(className) {
    return this.classes.has(className);
  }

  has(className) {
    return this.classes.has(className);
  }
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.textContent = '';
    this.placeholder = '';
    this.classList = new MockClassList();
    this.attributes = {};
    this.dataset = {};
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }
}

class MockDocument {
  constructor() {
    this.cookie = '';
    this.elements = [];
  }

  querySelector(selector) {
    return this.elements.find(el => {
      if (selector.startsWith('[data-i18n="')) {
        const key = selector.match(/data-i18n="([^"]+)"/)[1];
        return el.getAttribute('data-i18n') === key;
      }
      if (selector.startsWith('[data-i18n-placeholder="')) {
        const key = selector.match(/data-i18n-placeholder="([^"]+)"/)[1];
        return el.getAttribute('data-i18n-placeholder') === key;
      }
      if (selector.startsWith('[data-lang="')) {
        const lang = selector.match(/data-lang="([^"]+)"/)[1];
        return el.dataset.lang === lang;
      }
      return false;
    });
  }

  querySelectorAll(selector) {
    if (selector === '[data-i18n]') {
      return this.elements.filter(el => el.getAttribute('data-i18n'));
    }
    if (selector === '[data-i18n-placeholder]') {
      return this.elements.filter(el => el.getAttribute('data-i18n-placeholder'));
    }
    if (selector === '.lang-btn') {
      return this.elements.filter(el => el.classList.has('lang-btn'));
    }
    return [];
  }
}

// Setup mock DOM
const document = new MockDocument();

// Create mock elements
const titleEl = new MockElement('h1');
titleEl.setAttribute('data-i18n', 'loginTitle');
titleEl.textContent = '欢迎回来';
document.elements.push(titleEl);

const subtitleEl = new MockElement('p');
subtitleEl.setAttribute('data-i18n', 'loginSubtitle');
subtitleEl.textContent = '登录后即可评论、管理个人中心与同步会话。';
document.elements.push(subtitleEl);

const loginLabelEl = new MockElement('span');
loginLabelEl.setAttribute('data-i18n', 'loginLabel');
loginLabelEl.textContent = '登录名';
document.elements.push(loginLabelEl);

const passwordLabelEl = new MockElement('span');
passwordLabelEl.setAttribute('data-i18n', 'passwordLabel');
passwordLabelEl.textContent = '密码';
document.elements.push(passwordLabelEl);

const buttonEl = new MockElement('button');
buttonEl.setAttribute('data-i18n', 'loginButton');
buttonEl.textContent = '登录';
document.elements.push(buttonEl);

const loginInputEl = new MockElement('input');
loginInputEl.setAttribute('data-i18n-placeholder', 'loginPlaceholder');
loginInputEl.placeholder = '用户名或邮箱';
document.elements.push(loginInputEl);

const passwordInputEl = new MockElement('input');
passwordInputEl.setAttribute('data-i18n-placeholder', 'passwordPlaceholder');
passwordInputEl.placeholder = '请输入密码';
document.elements.push(passwordInputEl);

const zhBtnEl = new MockElement('button');
zhBtnEl.classList.add('lang-btn');
zhBtnEl.dataset.lang = 'zh';
document.elements.push(zhBtnEl);

const enBtnEl = new MockElement('button');
enBtnEl.classList.add('lang-btn');
enBtnEl.dataset.lang = 'en';
document.elements.push(enBtnEl);

// Mock navigator
const navigator = {
  language: 'zh-CN',
  userLanguage: 'zh-CN'
};

// Load and execute i18n.js
const i18nCode = fs.readFileSync(
  path.join(__dirname, 'themes/default/static/js/i18n.js'),
  'utf8'
);

// Create a window object
const window = {};

// Execute i18n.js in our mock environment
eval(i18nCode);

const I18n = window.I18n;

console.log('\n=== Login Page i18n Test Suite ===\n');

// Test 1: Initialization
test('I18n initializes with default language', () => {
  I18n.init();
  assert(I18n.getLang() === 'zh' || I18n.getLang() === 'en', 'Should initialize with zh or en');
});

// Test 2: Language switching to English
test('I18n switches to English', () => {
  I18n.init('en');
  assertEqual(I18n.getLang(), 'en', 'Language should be en');
});

// Test 3: Language switching to Chinese
test('I18n switches to Chinese', () => {
  I18n.init('zh');
  assertEqual(I18n.getLang(), 'zh', 'Language should be zh');
});

// Test 4: Translation function returns correct Chinese translation
test('Translation function returns correct Chinese translation', () => {
  I18n.init('zh');
  assertEqual(I18n.t('loginTitle'), '欢迎回来', 'Should return Chinese translation');
});

// Test 5: Translation function returns correct English translation
test('Translation function returns correct English translation', () => {
  I18n.init('en');
  assertEqual(I18n.t('loginTitle'), 'Welcome back', 'Should return English translation');
});

// Test 6: Translation function returns fallback
test('Translation function returns fallback for missing key', () => {
  I18n.init('zh');
  assertEqual(I18n.t('nonexistentKey', 'Fallback'), 'Fallback', 'Should return fallback');
});

// Test 7: Title updates when switching to English
test('Title element updates when switching to English', () => {
  I18n.init('zh');
  assertEqual(titleEl.textContent, '欢迎回来', 'Title should be in Chinese');
  
  I18n.init('en');
  assertEqual(titleEl.textContent, 'Welcome back', 'Title should update to English');
});

// Test 8: Subtitle updates when switching to Chinese
test('Subtitle element updates when switching to Chinese', () => {
  I18n.init('en');
  assertEqual(subtitleEl.textContent, 'Sign in to comment, manage your profile, and sync sessions.', 'Subtitle should be in English');
  
  I18n.init('zh');
  assertEqual(subtitleEl.textContent, '登录后即可评论、管理个人中心与同步会话。', 'Subtitle should update to Chinese');
});

// Test 9: Placeholder updates
test('Input placeholder updates when language changes', () => {
  I18n.init('zh');
  assertEqual(loginInputEl.placeholder, '用户名或邮箱', 'Placeholder should be in Chinese');
  
  I18n.init('en');
  assertEqual(loginInputEl.placeholder, 'Username or email', 'Placeholder should update to English');
});

// Test 10: All elements update simultaneously
test('All translatable elements update simultaneously', () => {
  I18n.init('zh');
  I18n.init('en');
  
  assertEqual(titleEl.textContent, 'Welcome back');
  assertEqual(subtitleEl.textContent, 'Sign in to comment, manage your profile, and sync sessions.');
  assertEqual(loginLabelEl.textContent, 'Username');
  assertEqual(passwordLabelEl.textContent, 'Password');
  assertEqual(buttonEl.textContent, 'Sign in');
  assertEqual(loginInputEl.placeholder, 'Username or email');
  assertEqual(passwordInputEl.placeholder, 'Enter your password');
});

// Test 11: Button state updates
test('Language button active class updates correctly', () => {
  I18n.init('zh');
  assert(zhBtnEl.classList.has('active'), 'Chinese button should have active class');
  assert(!enBtnEl.classList.has('active'), 'English button should not have active class');
  
  I18n.init('en');
  assert(!zhBtnEl.classList.has('active'), 'Chinese button should not have active class');
  assert(enBtnEl.classList.has('active'), 'English button should have active class');
});

// Test 12: Cookie persistence
test('Language preference is saved to cookie', () => {
  I18n.init('en');
  assert(document.cookie.includes('lang=en'), 'Cookie should contain lang=en');
});

// Test 13: All login page keys have translations
test('All login page keys have Chinese translations', () => {
  I18n.init('zh');
  const keys = ['loginTitle', 'loginSubtitle', 'loginLabel', 'passwordLabel', 'loginButton', 'loginPlaceholder', 'passwordPlaceholder'];
  
  keys.forEach(key => {
    const translation = I18n.t(key);
    assert(translation !== key, `Chinese translation missing for key: ${key}`);
  });
});

// Test 14: All login page keys have English translations
test('All login page keys have English translations', () => {
  I18n.init('en');
  const keys = ['loginTitle', 'loginSubtitle', 'loginLabel', 'passwordLabel', 'loginButton', 'loginPlaceholder', 'passwordPlaceholder'];
  
  keys.forEach(key => {
    const translation = I18n.t(key);
    assert(translation !== key, `English translation missing for key: ${key}`);
  });
});

// Test 15: Additional login page translations
test('Additional login page translations exist', () => {
  I18n.init('zh');
  assert(I18n.t('createAccount') !== 'createAccount', 'createAccount translation should exist');
  assert(I18n.t('backToHome') !== 'backToHome', 'backToHome translation should exist');
  
  I18n.init('en');
  assert(I18n.t('createAccount') !== 'createAccount', 'createAccount translation should exist');
  assert(I18n.t('backToHome') !== 'backToHome', 'backToHome translation should exist');
});

// Print summary
console.log('\n=== Test Summary ===');
console.log(`Total: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
