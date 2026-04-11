/**
 * Responsive Layout Test Suite
 * Tests responsive behavior across mobile, tablet, and desktop breakpoints
 * for both Login and Profile pages
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

// Read files
const loginHtml = fs.readFileSync(
  path.join(__dirname, 'themes/default/templates/login.html'),
  'utf8'
);

const profileHtml = fs.readFileSync(
  path.join(__dirname, 'themes/default/templates/profile.html'),
  'utf8'
);

const designSystemCss = fs.readFileSync(
  path.join(__dirname, 'themes/default/static/css/design-system.css'),
  'utf8'
);

console.log('\n=== Responsive Layout Test Suite ===\n');

// ============================================
// Login Page Responsive Tests
// ============================================

console.log('--- Login Page Responsive Tests ---\n');

// Test 1: Login mobile breakpoint (< 768px)
test('Login: Mobile breakpoint (< 768px) exists', () => {
  assertContains(loginHtml, '@media(max-width:767px)', 'Mobile breakpoint should exist');
});

// Test 2: Login mobile card padding
test('Login: Mobile card padding reduces to 22px', () => {
  const mobileSection = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'padding:30px 22px', 'Card padding should reduce on mobile');
});

// Test 3: Login mobile border-radius
test('Login: Mobile border-radius reduces to 22px', () => {
  const mobileSection = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'border-radius:22px', 'Border-radius should reduce on mobile');
});

// Test 4: Login mobile footer stacks vertically
test('Login: Mobile footer stacks vertically', () => {
  const mobileSection = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'flex-direction:column', 'Footer should stack vertically');
});

// Test 5: Login tablet breakpoint (768px - 1024px)
test('Login: Tablet breakpoint (768px - 1024px) exists', () => {
  assertContains(loginHtml, '@media(min-width:768px) and (max-width:1024px)', 'Tablet breakpoint should exist');
});

// Test 6: Login tablet card max-width
test('Login: Tablet card has appropriate max-width', () => {
  const tabletSection = loginHtml.split('@media(min-width:768px) and (max-width:1024px)')[1];
  assertContains(tabletSection, 'max-width:480px', 'Card should have 480px max-width on tablet');
});

// Test 7: Login desktop breakpoint (> 1024px)
test('Login: Desktop breakpoint (> 1024px) exists', () => {
  assertContains(loginHtml, '@media(min-width:1025px)', 'Desktop breakpoint should exist');
});

// Test 8: Login desktop card max-width constraint
test('Login: Desktop card has 420px max-width', () => {
  const desktopSection = loginHtml.split('@media(min-width:1025px)')[1];
  assertContains(desktopSection, 'max-width:420px', 'Card should have 420px max-width on desktop');
});

// Test 9: Login viewport meta tag
test('Login: Viewport meta tag is present', () => {
  assertContains(loginHtml, 'name="viewport"', 'Viewport meta tag should exist');
  assertContains(loginHtml, 'width=device-width', 'Viewport should be device-width');
});

// ============================================
// Profile Page Responsive Tests
// ============================================

console.log('\n--- Profile Page Responsive Tests ---\n');

// Test 10: Profile mobile breakpoint (< 768px)
test('Profile: Mobile breakpoint (< 768px) exists', () => {
  assertContains(profileHtml, '@media(max-width:767px)', 'Mobile breakpoint should exist');
});

// Test 11: Profile mobile form grid stacks vertically
test('Profile: Mobile form grid stacks vertically', () => {
  const mobileSection = profileHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'grid-template-columns:1fr', 'Form grid should be single column on mobile');
});

// Test 12: Profile mobile panel padding
test('Profile: Mobile panel padding reduces to 22px', () => {
  const mobileSection = profileHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'padding:22px', 'Panel padding should reduce on mobile');
});

// Test 13: Profile mobile hero section stacks vertically
test('Profile: Mobile hero section stacks vertically', () => {
  const mobileSection = profileHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'flex-direction:column', 'Hero should stack vertically on mobile');
});

// Test 14: Profile mobile navigation stacks vertically
test('Profile: Mobile navigation stacks vertically', () => {
  const mobileSection = profileHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, '.nav{flex-direction:column', 'Nav should stack vertically on mobile');
});

// Test 15: Profile mobile stats grid stacks vertically
test('Profile: Mobile stats grid stacks vertically', () => {
  const mobileSection = profileHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, '.stats-grid{grid-template-columns:1fr', 'Stats should stack vertically on mobile');
});

// Test 16: Profile mobile action buttons stack vertically
test('Profile: Mobile action buttons stack vertically', () => {
  const mobileSection = profileHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, '.actions{', 'Actions should have mobile styles');
  assertContains(mobileSection, 'flex-direction:column', 'Actions should stack vertically');
});

// Test 17: Profile tablet breakpoint (768px - 1024px)
test('Profile: Tablet breakpoint (768px - 1024px) exists', () => {
  assertContains(profileHtml, '@media(min-width:768px) and (max-width:1024px)', 'Tablet breakpoint should exist');
});

// Test 18: Profile tablet form grid uses two columns
test('Profile: Tablet form grid uses two columns', () => {
  const tabletSection = profileHtml.split('@media(min-width:768px) and (max-width:1024px)')[1];
  assertContains(tabletSection, 'grid-template-columns:repeat(2,minmax(0,1fr))', 'Form grid should be two columns on tablet');
});

// Test 19: Profile tablet stats grid maintains three columns
test('Profile: Tablet stats grid maintains three columns', () => {
  const tabletSection = profileHtml.split('@media(min-width:768px) and (max-width:1024px)')[1];
  assertContains(tabletSection, '.stats-grid{grid-template-columns:repeat(3,1fr)', 'Stats should be three columns on tablet');
});

// Test 20: Profile tablet max-width constraint
test('Profile: Tablet has 920px max-width constraint', () => {
  const tabletSection = profileHtml.split('@media(min-width:768px) and (max-width:1024px)')[1];
  assertContains(tabletSection, 'max-width:920px', 'Should have 920px max-width on tablet');
});

// Test 21: Profile desktop breakpoint (> 1024px)
test('Profile: Desktop breakpoint (> 1024px) exists', () => {
  assertContains(profileHtml, '@media(min-width:1025px)', 'Desktop breakpoint should exist');
});

// Test 22: Profile desktop form grid uses two columns
test('Profile: Desktop form grid uses two columns', () => {
  const desktopSection = profileHtml.split('@media(min-width:1025px)')[1];
  assertContains(desktopSection, 'grid-template-columns:repeat(2,minmax(0,1fr))', 'Form grid should be two columns on desktop');
});

// Test 23: Profile desktop max-width constraint
test('Profile: Desktop has 920px max-width constraint', () => {
  const desktopSection = profileHtml.split('@media(min-width:1025px)')[1];
  assertContains(desktopSection, 'max-width:920px', 'Should have 920px max-width on desktop');
});

// Test 24: Profile desktop stats grid maintains three columns
test('Profile: Desktop stats grid maintains three columns', () => {
  const desktopSection = profileHtml.split('@media(min-width:1025px)')[1];
  assertContains(desktopSection, '.stats-grid{grid-template-columns:repeat(3,1fr)', 'Stats should be three columns on desktop');
});

// Test 25: Profile viewport meta tag
test('Profile: Viewport meta tag is present', () => {
  assertContains(profileHtml, 'name="viewport"', 'Viewport meta tag should exist');
  assertContains(profileHtml, 'width=device-width', 'Viewport should be device-width');
});

// ============================================
// Design System Responsive Tests
// ============================================

console.log('\n--- Design System Responsive Tests ---\n');

// Test 26: Design system mobile breakpoint
test('Design System: Mobile breakpoint (< 768px) exists', () => {
  assertContains(designSystemCss, '@media (max-width: 767px)', 'Mobile breakpoint should exist in design system');
});

// Test 27: Design system mobile font size adjustments
test('Design System: Mobile font sizes adjust appropriately', () => {
  const mobileSection = designSystemCss.split('@media (max-width: 767px)')[1];
  assertContains(mobileSection, '--display-large-size: 2.5rem', 'Display large should be 2.5rem on mobile');
  assertContains(mobileSection, '--headline-medium-size: 1.5rem', 'Headline medium should be 1.5rem on mobile');
});

// Test 28: Design system mobile card padding
test('Design System: Mobile card padding reduces to 22px', () => {
  const mobileSection = designSystemCss.split('@media (max-width: 767px)')[1];
  assertContains(mobileSection, 'padding: 22px', 'Card padding should reduce on mobile');
});

// Test 29: Design system mobile border-radius
test('Design System: Mobile border-radius reduces to 22px', () => {
  const mobileSection = designSystemCss.split('@media (max-width: 767px)')[1];
  assertContains(mobileSection, 'border-radius: 22px', 'Border-radius should reduce on mobile');
});

// Test 30: Design system mobile form grid stacks
test('Design System: Mobile form grid stacks vertically', () => {
  const mobileSection = designSystemCss.split('@media (max-width: 767px)')[1];
  assertContains(mobileSection, 'grid-template-columns: 1fr !important', 'Form grid should stack on mobile');
});

// Test 31: Design system tablet breakpoint
test('Design System: Tablet breakpoint (768px - 1024px) exists', () => {
  assertContains(designSystemCss, '@media (min-width: 768px) and (max-width: 1024px)', 'Tablet breakpoint should exist');
});

// Test 32: Design system tablet form grid
test('Design System: Tablet form grid uses two columns', () => {
  const tabletSection = designSystemCss.split('@media (min-width: 768px) and (max-width: 1024px)')[1];
  assertContains(tabletSection, 'grid-template-columns: repeat(2, minmax(0, 1fr))', 'Form grid should be two columns on tablet');
});

// Test 33: Design system tablet max-width
test('Design System: Tablet has 920px max-width', () => {
  const tabletSection = designSystemCss.split('@media (min-width: 768px) and (max-width: 1024px)')[1];
  assertContains(tabletSection, 'max-width: 920px', 'Should have 920px max-width on tablet');
});

// Test 34: Design system desktop breakpoint
test('Design System: Desktop breakpoint (> 1024px) exists', () => {
  assertContains(designSystemCss, '@media (min-width: 1025px)', 'Desktop breakpoint should exist');
});

// Test 35: Design system desktop max-width
test('Design System: Desktop has 920px max-width', () => {
  const desktopSection = designSystemCss.split('@media (min-width: 1025px)')[1];
  assertContains(desktopSection, 'max-width: 920px', 'Should have 920px max-width on desktop');
});

// ============================================
// Readability and Usability Tests
// ============================================

console.log('\n--- Readability and Usability Tests ---\n');

// Test 36: Font sizes remain readable on mobile
test('Font sizes remain readable on mobile (not too small)', () => {
  const loginMobile = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(loginMobile, 'font-size:26px', 'Mobile title should be at least 26px');
  assertContains(loginMobile, 'font-size:14px', 'Mobile body text should be at least 14px');
});

// Test 37: Touch targets are appropriately sized
test('Touch targets are appropriately sized (buttons, inputs)', () => {
  assertContains(loginHtml, 'padding:14px', 'Inputs should have adequate padding for touch');
  assertContains(profileHtml, 'padding:14px', 'Profile inputs should have adequate padding');
});

// Test 38: Spacing scales appropriately
test('Spacing scales appropriately across breakpoints', () => {
  assertContains(profileHtml, 'padding:22px', 'Mobile should have reduced padding');
  assertContains(profileHtml, 'var(--space-xl)', 'Tablet/desktop should use design tokens');
});

// Test 39: No horizontal scrolling on mobile
test('No fixed widths that would cause horizontal scrolling', () => {
  assertNotContains(loginHtml, 'width:600px', 'Should not have large fixed widths');
  assertNotContains(profileHtml, 'width:1200px', 'Should not have large fixed widths');
});

// Test 40: Flexible layouts use appropriate units
test('Flexible layouts use appropriate units (%, fr, auto)', () => {
  assertContains(loginHtml, 'width:100%', 'Should use percentage widths');
  assertContains(profileHtml, 'grid-template-columns:repeat', 'Should use fr units in grid');
});

console.log('\n=== Test Summary ===');
console.log(`Total: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ All responsive layout tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
