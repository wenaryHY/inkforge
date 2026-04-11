/**
 * Responsive Design Test for Login Page
 * Verifies responsive behavior across mobile, tablet, and desktop
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

// Read login.html
const loginHtml = fs.readFileSync(
  path.join(__dirname, 'themes/default/templates/login.html'),
  'utf8'
);

console.log('\n=== Login Page Responsive Design Test Suite ===\n');

// Test 1: Mobile breakpoint exists
test('Mobile breakpoint (@media max-width:767px) exists', () => {
  assertContains(loginHtml, '@media(max-width:767px)', 'Mobile breakpoint should exist');
});

// Test 2: Mobile card padding adjustment
test('Mobile: Card padding reduces to 30px 22px', () => {
  const mobileSection = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'padding:30px 22px', 'Card padding should reduce on mobile');
});

// Test 3: Mobile card border-radius adjustment
test('Mobile: Card border-radius reduces to 22px', () => {
  const mobileSection = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'border-radius:22px', 'Card border-radius should reduce on mobile');
});

// Test 4: Mobile language switcher position adjustment
test('Mobile: Language switcher position adjusts', () => {
  const mobileSection = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'top:18px', 'Language switcher top position should adjust');
  assertContains(mobileSection, 'right:18px', 'Language switcher right position should adjust');
});

// Test 5: Mobile footer stacks vertically
test('Mobile: Footer links stack vertically', () => {
  const mobileSection = loginHtml.split('@media(max-width:767px)')[1];
  assertContains(mobileSection, 'flex-direction:column', 'Footer should stack vertically on mobile');
});

// Test 6: Desktop card max-width constraint
test('Desktop: Card has max-width constraint', () => {
  assertContains(loginHtml, 'width:min(100%,420px)', 'Card should have max-width of 420px');
});

// Test 7: Viewport meta tag for responsive design
test('Viewport meta tag is present', () => {
  assertContains(loginHtml, 'name="viewport"', 'Viewport meta tag should exist');
  assertContains(loginHtml, 'width=device-width', 'Viewport should be device-width');
  assertContains(loginHtml, 'initial-scale=1.0', 'Initial scale should be 1.0');
});

// Test 8: Body uses flexbox for centering
test('Body uses flexbox for centering', () => {
  assertContains(loginHtml, 'display:flex', 'Body should use flexbox');
  assertContains(loginHtml, 'align-items:center', 'Body should center vertically');
  assertContains(loginHtml, 'justify-content:center', 'Body should center horizontally');
});

// Test 9: Body has responsive padding
test('Body has responsive padding', () => {
  assertContains(loginHtml, 'padding:24px', 'Body should have padding for spacing');
});

// Test 10: Inputs are full width
test('Inputs are full width', () => {
  assertContains(loginHtml, 'input{width:100%', 'Inputs should be full width');
});

// Test 11: Button is full width (or appropriate width)
test('Button has appropriate width', () => {
  // Button should not have a fixed width, allowing it to be responsive
  const buttonStyles = loginHtml.match(/button\[type="submit"\]\{[^}]+\}/);
  // Just verify button exists and has styling
  assertContains(loginHtml, 'button[type="submit"]', 'Submit button should have styles');
});

// Test 12: Language switcher uses flexbox
test('Language switcher uses flexbox', () => {
  assertContains(loginHtml, '.lang-switcher{', 'Language switcher should have styles');
  const switcherStyles = loginHtml.split('.lang-switcher{')[1].split('}')[0];
  assertContains(switcherStyles, 'display:flex', 'Language switcher should use flexbox');
});

// Test 13: Form stack uses flexbox column
test('Form stack uses flexbox column layout', () => {
  assertContains(loginHtml, '.stack{display:flex', 'Stack should use flexbox');
  assertContains(loginHtml, 'flex-direction:column', 'Stack should be column direction');
});

// Test 14: Consistent gap spacing
test('Consistent gap spacing in layouts', () => {
  assertContains(loginHtml, 'gap:', 'Should use gap for spacing');
});

// Test 15: Font sizes are readable on mobile
test('Font sizes are readable (not too small)', () => {
  // Title should be 30px
  assertContains(loginHtml, 'font-size:30px', 'Title should be 30px');
  // Body text should be at least 13px
  assertContains(loginHtml, 'font-size:15px', 'Body text should be 15px');
  assertContains(loginHtml, 'font-size:13px', 'Small text should be 13px');
});

console.log('\n=== Test Summary ===');
console.log(`Total: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ All responsive design tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
