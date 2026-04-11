/**
 * Visual and Authentication Flow Test for Login Page
 * This script verifies the login page HTML structure and styling
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    passCount++;
    console.log(`✓ ${name}`);
  } catch (error) {
    failCount++;
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(`${message || 'String does not contain substring'}: "${substring}" not found`);
  }
}

function assertNotContains(str, substring, message) {
  if (str.includes(substring)) {
    throw new Error(`${message || 'String should not contain substring'}: "${substring}" found`);
  }
}

// Read login.html
const loginHtml = fs.readFileSync(
  path.join(__dirname, 'themes/default/templates/login.html'),
  'utf8'
);

console.log('\n=== Login Page Visual & Structure Test Suite ===\n');

// Test 1: Language switcher exists
test('Language switcher component exists', () => {
  assertContains(loginHtml, 'class="lang-switcher"', 'Language switcher should exist');
  assertContains(loginHtml, 'data-lang="zh"', 'Chinese button should exist');
  assertContains(loginHtml, 'data-lang="en"', 'English button should exist');
});

// Test 2: All translatable elements have data-i18n attributes
test('All text elements have data-i18n attributes', () => {
  assertContains(loginHtml, 'data-i18n="loginTitle"', 'Title should have i18n attribute');
  assertContains(loginHtml, 'data-i18n="loginSubtitle"', 'Subtitle should have i18n attribute');
  assertContains(loginHtml, 'data-i18n="loginLabel"', 'Login label should have i18n attribute');
  assertContains(loginHtml, 'data-i18n="passwordLabel"', 'Password label should have i18n attribute');
  assertContains(loginHtml, 'data-i18n="loginButton"', 'Button should have i18n attribute');
});

// Test 3: Placeholders have data-i18n-placeholder attributes
test('Input placeholders have data-i18n-placeholder attributes', () => {
  assertContains(loginHtml, 'data-i18n-placeholder="loginPlaceholder"', 'Login input should have i18n placeholder');
  assertContains(loginHtml, 'data-i18n-placeholder="passwordPlaceholder"', 'Password input should have i18n placeholder');
});

// Test 4: i18n.js is loaded
test('i18n.js script is loaded', () => {
  assertContains(loginHtml, 'i18n.js', 'i18n.js should be loaded');
});

// Test 5: site-api.js is loaded
test('site-api.js script is loaded', () => {
  assertContains(loginHtml, 'site-api.js', 'site-api.js should be loaded');
});

// Test 6: Form has correct structure
test('Login form has correct structure', () => {
  assertContains(loginHtml, 'id="loginForm"', 'Form should have id');
  assertContains(loginHtml, 'type="text"', 'Login input should be text type');
  assertContains(loginHtml, 'type="password"', 'Password input should be password type');
  assertContains(loginHtml, 'type="submit"', 'Submit button should exist');
});

// Test 7: Form inputs have autocomplete attributes
test('Form inputs have autocomplete attributes', () => {
  assertContains(loginHtml, 'autocomplete="username"', 'Login input should have autocomplete');
  assertContains(loginHtml, 'autocomplete="current-password"', 'Password input should have autocomplete');
});

// Test 8: Error alert element exists
test('Error alert element exists', () => {
  assertContains(loginHtml, 'id="errorAlert"', 'Error alert should exist');
  assertContains(loginHtml, 'class="alert"', 'Alert should have alert class');
});

// Test 9: Navigation links exist
test('Navigation links exist', () => {
  assertContains(loginHtml, 'href="/register"', 'Register link should exist');
  assertContains(loginHtml, 'href="/"', 'Home link should exist');
  assertContains(loginHtml, 'data-i18n="createAccount"', 'Create account link should have i18n');
  assertContains(loginHtml, 'data-i18n="backToHome"', 'Back to home link should have i18n');
});

// Test 10: Design system fonts are loaded
test('Design system fonts are loaded', () => {
  assertContains(loginHtml, 'Manrope', 'Manrope font should be loaded');
  assertContains(loginHtml, 'Plus+Jakarta+Sans', 'Plus Jakarta Sans font should be loaded');
});

// Test 11: No 1px borders in CSS (design system rule)
test('No 1px borders in inline CSS', () => {
  assertNotContains(loginHtml, 'border:1px', 'Should not have 1px borders');
  assertNotContains(loginHtml, 'border: 1px', 'Should not have 1px borders');
});

// Test 12: Glassmorphic effect applied
test('Glassmorphic effect (backdrop-filter) applied', () => {
  assertContains(loginHtml, 'backdrop-filter:blur', 'Should have backdrop-filter blur');
});

// Test 13: Large border-radius values
test('Large border-radius values (28px for card)', () => {
  assertContains(loginHtml, 'border-radius:28px', 'Card should have 28px border-radius');
});

// Test 14: Orange primary color used
test('Orange primary color (#FF6D00) used', () => {
  assertContains(loginHtml, '#FF6D00', 'Should use orange primary color');
});

// Test 15: Solid color button (no gradient)
test('Submit button uses solid color (no gradient)', () => {
  assertContains(loginHtml, 'background:#FF6D00', 'Button should have solid orange background');
  assertNotContains(loginHtml, 'linear-gradient', 'Button should not have gradient');
});

// Test 16: Form submission handler exists
test('Form submission handler exists', () => {
  assertContains(loginHtml, 'addEventListener(\'submit\'', 'Form should have submit handler');
  assertContains(loginHtml, 'window.InkForgeApi.login', 'Should call InkForgeApi.login');
});

// Test 17: Language switcher handler exists
test('Language switcher handler exists', () => {
  assertContains(loginHtml, 'I18n.init()', 'Should initialize I18n');
  assertContains(loginHtml, 'I18n.init(btn.dataset.lang)', 'Should switch language on button click');
});

// Test 18: Button disabled during submission
test('Submit button is disabled during API call', () => {
  assertContains(loginHtml, 'button.disabled = true', 'Button should be disabled during submission');
  assertContains(loginHtml, 'button.disabled = false', 'Button should be re-enabled after submission');
});

// Test 19: Error handling exists
test('Error handling exists', () => {
  assertContains(loginHtml, 'catch', 'Should have error handling');
  assertContains(loginHtml, 'alertEl.textContent', 'Should display error message');
  assertContains(loginHtml, 'alertEl.style.display', 'Should show/hide alert');
});

// Test 20: Redirect after successful login
test('Redirect after successful login', () => {
  assertContains(loginHtml, 'window.location.href = redirectTo', 'Should redirect after login');
});

// Test 21: Responsive design (mobile breakpoint)
test('Responsive design for mobile', () => {
  assertContains(loginHtml, '@media(max-width:767px)', 'Should have mobile breakpoint');
});

// Test 22: Input focus states
test('Input focus states with orange accent', () => {
  assertContains(loginHtml, 'input:focus', 'Should have focus state');
  assertContains(loginHtml, 'box-shadow:0 0 0 2px #FF6D00', 'Focus should use orange accent');
});

// Test 23: Button hover effects
test('Button hover effects', () => {
  assertContains(loginHtml, 'button[type="submit"]:hover', 'Should have hover state');
  assertContains(loginHtml, 'transform:translateY(-1px)', 'Should have lift effect on hover');
});

// Test 24: Disabled button state
test('Disabled button state', () => {
  assertContains(loginHtml, 'button[type="submit"]:disabled', 'Should have disabled state');
  assertContains(loginHtml, 'opacity:.5', 'Disabled button should have reduced opacity');
});

// Test 25: Card shadow
test('Card has appropriate shadow', () => {
  assertContains(loginHtml, 'box-shadow:0 28px 80px', 'Card should have large shadow');
});

console.log('\n=== Test Summary ===');
console.log(`Total: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ All visual and structure tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
