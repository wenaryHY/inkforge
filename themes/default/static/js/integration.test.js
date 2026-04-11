/**
 * Integration Tests for Editorial Profile & Login Redesign
 * Task 13: Final checkpoint - Complete testing
 * 
 * This test suite verifies:
 * 1. Complete user flows on both pages
 * 2. Responsive behavior across all devices
 * 3. Language switching on both pages
 * 4. API integrations
 * 5. Design system compliance
 * 
 * Run with: node integration.test.js
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testPassed(name) {
  console.log(`✅ PASSED: ${name}`);
}

function testFailed(name, error) {
  console.log(`❌ FAILED: ${name}`);
  console.log(`   Error: ${error.message}`);
}

// ============================================
// Design System Compliance Tests
// ============================================

/**
 * Test: Verify no 1px borders in design system
 * Validates: Requirements 1.1, 1.2
 */
function testNoBordersInDesignSystem() {
  const testName = 'Design System: No 1px borders';
  
  try {
    const cssPath = path.join(__dirname, '../css/design-system.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for 1px borders (excluding box-shadow which is allowed)
    const borderRegex = /border:\s*1px/gi;
    const matches = cssContent.match(borderRegex);
    
    // Allow ghost-border class as it's explicitly documented
    const allowedMatches = cssContent.match(/\.ghost-border\s*{[^}]*border:\s*1px/gi);
    const allowedCount = allowedMatches ? allowedMatches.length : 0;
    const actualCount = matches ? matches.length : 0;
    
    assert(
      actualCount === allowedCount,
      `Found ${actualCount - allowedCount} unexpected 1px borders (${allowedCount} allowed in .ghost-border)`
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Verify large rounded corners (28px-48px)
 * Validates: Requirements 1.2, 1.3
 */
function testLargeRoundedCorners() {
  const testName = 'Design System: Large rounded corners for cards';
  
  try {
    const cssPath = path.join(__dirname, '../css/design-system.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for card border-radius values
    assert(
      cssContent.includes('--radius-lg: 2rem'),
      'Should define --radius-lg as 2rem (32px)'
    );
    assert(
      cssContent.includes('--radius-xl: 3rem'),
      'Should define --radius-xl as 3rem (48px)'
    );
    
    // Verify cards use large radius
    assert(
      cssContent.includes('.card-lg') && cssContent.includes('border-radius: var(--radius-lg)'),
      'card-lg should use large border-radius'
    );
    assert(
      cssContent.includes('.card-xl') && cssContent.includes('border-radius: var(--radius-xl)'),
      'card-xl should use extra-large border-radius'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Verify glassmorphic effects
 * Validates: Requirements 1.3, 1.4
 */
function testGlassmorphicEffects() {
  const testName = 'Design System: Glassmorphic effects with backdrop-filter';
  
  try {
    const cssPath = path.join(__dirname, '../css/design-system.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for backdrop-filter definitions
    assert(
      cssContent.includes('backdrop-filter: blur'),
      'Should use backdrop-filter blur for glassmorphic effects'
    );
    assert(
      cssContent.includes('-webkit-backdrop-filter: blur'),
      'Should include -webkit-backdrop-filter for Safari support'
    );
    
    // Check for glass utility classes
    assert(
      cssContent.includes('.glass {'),
      'Should define .glass utility class'
    );
    assert(
      cssContent.includes('.glass-strong {'),
      'Should define .glass-strong utility class'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Verify solid color buttons (no gradients)
 * Validates: Requirements 1.4, 3.1
 */
function testSolidColorButtons() {
  const testName = 'Design System: Solid color buttons without gradients';
  
  try {
    const cssPath = path.join(__dirname, '../css/design-system.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Extract button styles
    const btnPrimaryMatch = cssContent.match(/\.btn-primary\s*{[^}]*}/s);
    assert(btnPrimaryMatch, 'Should define .btn-primary class');
    
    const btnPrimaryStyles = btnPrimaryMatch[0];
    
    // Verify solid background (no gradient)
    assert(
      btnPrimaryStyles.includes('background: var(--primary)'),
      'Primary button should use solid color background'
    );
    assert(
      !btnPrimaryStyles.includes('linear-gradient') && !btnPrimaryStyles.includes('radial-gradient'),
      'Primary button should not use gradients'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Verify orange primary color
 * Validates: Requirement 1.6
 */
function testOrangePrimaryColor() {
  const testName = 'Design System: Orange (#FF6D00) primary color';
  
  try {
    const cssPath = path.join(__dirname, '../css/design-system.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for primary color definition
    assert(
      cssContent.includes('--primary: #FF6D00'),
      'Should define --primary as #FF6D00'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Login Page Tests
// ============================================

/**
 * Test: Login page structure and elements
 * Validates: Requirements 2.1, 2.5, 3.1-3.5
 */
function testLoginPageStructure() {
  const testName = 'Login Page: Structure and elements';
  
  try {
    const htmlPath = path.join(__dirname, '../../../templates/login.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Check for language switcher
    const langSwitcher = document.querySelector('.lang-switcher');
    assert(langSwitcher !== null, 'Should have language switcher');
    
    const langButtons = document.querySelectorAll('.lang-btn');
    assert(langButtons.length === 2, 'Should have 2 language buttons');
    
    // Check for translatable elements
    const i18nElements = document.querySelectorAll('[data-i18n]');
    assert(i18nElements.length > 0, 'Should have translatable elements');
    
    // Check for form elements
    const loginForm = document.querySelector('#loginForm');
    assert(loginForm !== null, 'Should have login form');
    
    const loginInput = document.querySelector('#login');
    assert(loginInput !== null, 'Should have login input');
    
    const passwordInput = document.querySelector('#password');
    assert(passwordInput !== null, 'Should have password input');
    
    const submitBtn = document.querySelector('#submitBtn');
    assert(submitBtn !== null, 'Should have submit button');
    
    // Check for i18n script
    assert(
      htmlContent.includes('i18n.js'),
      'Should load i18n.js script'
    );
    
    // Check for site-api script
    assert(
      htmlContent.includes('site-api.js'),
      'Should load site-api.js script'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Login page language switching
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
function testLoginPageLanguageSwitching() {
  const testName = 'Login Page: Language switching functionality';
  
  try {
    const htmlPath = path.join(__dirname, '../../../templates/login.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const i18nPath = path.join(__dirname, 'i18n.js');
    const i18nCode = fs.readFileSync(i18nPath, 'utf8');
    
    const dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable'
    });
    const document = dom.window.document;
    const window = dom.window;
    
    // Load i18n.js
    const script = document.createElement('script');
    script.textContent = i18nCode;
    document.head.appendChild(script);
    
    const I18n = window.I18n;
    
    // Test Chinese initialization
    I18n.init('zh');
    assert(I18n.getLang() === 'zh', 'Should initialize with Chinese');
    
    const titleZh = document.querySelector('[data-i18n="loginTitle"]');
    assert(
      titleZh.textContent === '欢迎回来',
      'Title should be in Chinese'
    );
    
    // Test English switching
    I18n.init('en');
    assert(I18n.getLang() === 'en', 'Should switch to English');
    
    const titleEn = document.querySelector('[data-i18n="loginTitle"]');
    assert(
      titleEn.textContent === 'Welcome back',
      'Title should be in English'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Profile Page Tests
// ============================================

/**
 * Test: Profile page structure and sections
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */
function testProfilePageStructure() {
  const testName = 'Profile Page: Structure and sections';
  
  try {
    const htmlPath = path.join(__dirname, '../../../templates/profile.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Check for glassmorphic navigation
    const nav = document.querySelector('.nav');
    assert(nav !== null, 'Should have navigation bar');
    
    // Check for language switcher in nav
    const langSwitcher = document.querySelector('.lang-switch');
    assert(langSwitcher !== null, 'Should have language switcher in nav');
    
    // Check for user hero section
    const heroSection = document.querySelector('.hero-section');
    assert(heroSection !== null, 'Should have hero section');
    
    const avatar = document.querySelector('.avatar');
    assert(avatar !== null, 'Should have avatar');
    
    // Check for statistics display
    const statsGrid = document.querySelector('.stats-grid');
    assert(statsGrid !== null, 'Should have stats grid');
    
    const statCards = document.querySelectorAll('.stat-card');
    assert(statCards.length === 3, 'Should have 3 stat cards');
    
    // Check for profile settings panel
    const profileForm = document.querySelector('#profileForm');
    assert(profileForm !== null, 'Should have profile form');
    
    // Check for password change panel
    const passwordForm = document.querySelector('#passwordForm');
    assert(passwordForm !== null, 'Should have password form');
    
    // Check for comments section
    const commentsList = document.querySelector('#commentsList');
    assert(commentsList !== null, 'Should have comments list');
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Profile page navigation actions
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4
 */
function testProfilePageNavigation() {
  const testName = 'Profile Page: Navigation actions';
  
  try {
    const htmlPath = path.join(__dirname, '../../../templates/profile.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Check for "Back home" button
    const backHomeBtn = document.querySelector('a[href="/"]');
    assert(backHomeBtn !== null, 'Should have "Back home" button');
    assert(
      backHomeBtn.hasAttribute('data-i18n'),
      '"Back home" button should be translatable'
    );
    
    // Check for "Admin" button
    const adminBtn = document.querySelector('a[href*="admin"]');
    assert(adminBtn !== null, 'Should have "Admin" button');
    
    // Check for "Sign out" button
    const signOutBtn = document.querySelector('#logoutBtn');
    assert(signOutBtn !== null, 'Should have "Sign out" button');
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Profile page form fields
 * Validates: Requirements 9.1, 12.1-12.5
 */
function testProfilePageForms() {
  const testName = 'Profile Page: Form fields and styling';
  
  try {
    const htmlPath = path.join(__dirname, '../../../templates/profile.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Check profile form fields
    const displayNameInput = document.querySelector('#displayName');
    assert(displayNameInput !== null, 'Should have display name input');
    assert(displayNameInput.required, 'Display name should be required');
    
    const languageSelect = document.querySelector('#language');
    assert(languageSelect !== null, 'Should have language select');
    
    const themeSelect = document.querySelector('#themePreference');
    assert(themeSelect !== null, 'Should have theme preference select');
    
    const bioTextarea = document.querySelector('#bio');
    assert(bioTextarea !== null, 'Should have bio textarea');
    
    // Check password form fields
    const currentPasswordInput = document.querySelector('#currentPassword');
    assert(currentPasswordInput !== null, 'Should have current password input');
    assert(currentPasswordInput.required, 'Current password should be required');
    
    const newPasswordInput = document.querySelector('#newPassword');
    assert(newPasswordInput !== null, 'Should have new password input');
    assert(newPasswordInput.required, 'New password should be required');
    
    const confirmPasswordInput = document.querySelector('#confirmPassword');
    assert(confirmPasswordInput !== null, 'Should have confirm password input');
    assert(confirmPasswordInput.required, 'Confirm password should be required');
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Responsive Design Tests
// ============================================

/**
 * Test: Responsive breakpoints defined
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4
 */
function testResponsiveBreakpoints() {
  const testName = 'Responsive Design: Breakpoints defined';
  
  try {
    const cssPath = path.join(__dirname, '../css/design-system.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for mobile breakpoint (< 768px)
    assert(
      cssContent.includes('@media (max-width: 767px)') || cssContent.includes('@media(max-width:767px)'),
      'Should define mobile breakpoint'
    );
    
    // Check for tablet breakpoint (768px - 1024px)
    assert(
      cssContent.includes('@media (min-width: 768px) and (max-width: 1024px)') ||
      cssContent.includes('@media(min-width:768px) and (max-width:1024px)'),
      'Should define tablet breakpoint'
    );
    
    // Check for desktop breakpoint (> 1024px)
    assert(
      cssContent.includes('@media (min-width: 1025px)') || cssContent.includes('@media(min-width:1025px)'),
      'Should define desktop breakpoint'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Test: Mobile responsive adjustments
 * Validates: Requirements 8.1, 8.2
 */
function testMobileResponsive() {
  const testName = 'Responsive Design: Mobile adjustments';
  
  try {
    const profileHtmlPath = path.join(__dirname, '../../../templates/profile.html');
    const profileHtmlContent = fs.readFileSync(profileHtmlPath, 'utf8');
    
    // Check for mobile-specific styles in profile.html
    assert(
      profileHtmlContent.includes('@media(max-width:767px)'),
      'Profile page should have mobile breakpoint styles'
    );
    
    // Verify mobile adjustments
    assert(
      profileHtmlContent.includes('grid-template-columns:1fr'),
      'Should stack form fields vertically on mobile'
    );
    assert(
      profileHtmlContent.includes('flex-direction:column'),
      'Should stack navigation vertically on mobile'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// API Integration Tests
// ============================================

/**
 * Test: API client functions defined
 * Validates: Requirements 9.2, 9.3, 6.2, 6.3
 */
function testAPIIntegration() {
  const testName = 'API Integration: Client functions';
  
  try {
    const apiPath = path.join(__dirname, 'site-api.js');
    const apiCode = fs.readFileSync(apiPath, 'utf8');
    
    // Check for core API functions
    assert(
      apiCode.includes('function login'),
      'Should define login function'
    );
    assert(
      apiCode.includes('function logout'),
      'Should define logout function'
    );
    assert(
      apiCode.includes('function apiRequest'),
      'Should define apiRequest function'
    );
    
    // Check for error handling
    assert(
      apiCode.includes('error.message') || apiCode.includes('Error('),
      'Should handle errors'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// I18n System Tests
// ============================================

/**
 * Test: I18n dictionary completeness
 * Validates: Requirements 2.1, 7.1, 7.3
 */
function testI18nDictionary() {
  const testName = 'I18n System: Dictionary completeness';
  
  try {
    const i18nPath = path.join(__dirname, 'i18n.js');
    const i18nCode = fs.readFileSync(i18nPath, 'utf8');
    
    // Check for both language dictionaries
    assert(
      i18nCode.includes('zh: {'),
      'Should define Chinese dictionary'
    );
    assert(
      i18nCode.includes('en: {'),
      'Should define English dictionary'
    );
    
    // Check for key translation categories
    const requiredKeys = [
      'loginTitle',
      'loginSubtitle',
      'backHome',
      'signOut',
      'profileSettings',
      'changePassword',
      'myComments'
    ];
    
    requiredKeys.forEach(key => {
      assert(
        i18nCode.includes(`${key}:`),
        `Should define translation key: ${key}`
      );
    });
    
    // Check for cookie persistence
    assert(
      i18nCode.includes('setCookie'),
      'Should implement cookie persistence'
    );
    assert(
      i18nCode.includes('getCookie'),
      'Should implement cookie reading'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Run all integration tests
// ============================================

console.log('\n🧪 Running Integration Tests - Task 13: Final Checkpoint\n');
console.log('=' .repeat(70));

let failedTests = 0;

try {
  // Design System Compliance
  console.log('\n📐 Design System Compliance Tests:');
  testNoBordersInDesignSystem();
  testLargeRoundedCorners();
  testGlassmorphicEffects();
  testSolidColorButtons();
  testOrangePrimaryColor();
  
  // Login Page
  console.log('\n🔐 Login Page Tests:');
  testLoginPageStructure();
  testLoginPageLanguageSwitching();
  
  // Profile Page
  console.log('\n👤 Profile Page Tests:');
  testProfilePageStructure();
  testProfilePageNavigation();
  testProfilePageForms();
  
  // Responsive Design
  console.log('\n📱 Responsive Design Tests:');
  testResponsiveBreakpoints();
  testMobileResponsive();
  
  // API Integration
  console.log('\n🔌 API Integration Tests:');
  testAPIIntegration();
  
  // I18n System
  console.log('\n🌐 I18n System Tests:');
  testI18nDictionary();
  
  console.log('\n' + '=' .repeat(70));
  console.log('\n✅ All integration tests passed!\n');
  process.exit(0);
} catch (error) {
  failedTests++;
  console.log('\n' + '=' .repeat(70));
  console.log('\n❌ Some integration tests failed\n');
  process.exit(1);
}
