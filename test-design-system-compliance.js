/**
 * Design System Compliance Test Suite
 * Verifies that all design system rules from "The Radiant Minimalist" are applied correctly
 * 
 * Design Rules:
 * 1. NO 1px borders (use color layering instead)
 * 2. Large rounded corners (28px-48px for cards, 16px for inputs)
 * 3. Glassmorphic effects with backdrop-filter
 * 4. Solid color buttons (no gradients)
 * 5. Orange primary color (#FF6D00)
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

function countOccurrences(str, pattern) {
  const matches = str.match(pattern);
  return matches ? matches.length : 0;
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

console.log('\n=== Design System Compliance Test Suite ===\n');

// ============================================
// Rule 1: NO 1px Borders
// ============================================

console.log('--- Rule 1: NO 1px Borders (Use Color Layering) ---\n');

test('Login: No 1px borders in button styles', () => {
  const buttonStyles = loginHtml.match(/button\[type="submit"\]\{[^}]+\}/g);
  if (buttonStyles) {
    buttonStyles.forEach(style => {
      assertNotContains(style, 'border:1px', 'Buttons should not have 1px borders');
    });
  }
});

test('Login: Inputs use box-shadow instead of border', () => {
  assertContains(loginHtml, 'box-shadow:0 0 0 1px rgba', 'Inputs should use box-shadow for borders');
  assertContains(loginHtml, 'border:none', 'Inputs should have border:none');
});

test('Profile: No 1px borders in navigation', () => {
  const navStyles = profileHtml.match(/\.nav\{[^}]+\}/g);
  if (navStyles) {
    navStyles.forEach(style => {
      assertNotContains(style, 'border:1px', 'Navigation should not have 1px borders');
    });
  }
});

test('Profile: Cards use background layering instead of borders', () => {
  assertContains(profileHtml, 'background:var(--surface-container', 'Cards should use background layering');
});

test('Design System: Ghost borders only at 15% opacity', () => {
  assertContains(designSystemCss, '--outline-variant: rgba(195, 174, 164, 0.15)', 'Ghost borders should be 15% opacity');
});

test('Design System: Inputs use box-shadow for borders', () => {
  assertContains(designSystemCss, 'box-shadow: 0 0 0 1px var(--outline-variant)', 'Inputs should use box-shadow');
  assertContains(designSystemCss, 'border: none', 'Inputs should have border: none');
});

// ============================================
// Rule 2: Large Rounded Corners
// ============================================

console.log('\n--- Rule 2: Large Rounded Corners (28px-48px for cards, 16px for inputs) ---\n');

test('Login: Card has 28px border-radius', () => {
  assertContains(loginHtml, 'border-radius:28px', 'Login card should have 28px border-radius');
});

test('Login: Inputs have 16px border-radius', () => {
  assertContains(loginHtml, 'border-radius:16px', 'Inputs should have 16px border-radius');
});

test('Login: Button has pill-shaped border-radius', () => {
  assertContains(loginHtml, 'border-radius:9999px', 'Submit button should be pill-shaped');
});

test('Profile: Hero section has large border-radius (48px)', () => {
  assertContains(profileHtml, 'border-radius:var(--radius-xl)', 'Hero section should use --radius-xl');
  assertContains(designSystemCss, '--radius-xl: 3rem', '--radius-xl should be 48px (3rem)');
});

test('Profile: Panels have 32px border-radius', () => {
  assertContains(profileHtml, 'border-radius:var(--radius-lg)', 'Panels should use --radius-lg');
  assertContains(designSystemCss, '--radius-lg: 2rem', '--radius-lg should be 32px (2rem)');
});

test('Profile: Avatar has 28px border-radius', () => {
  assertContains(profileHtml, 'border-radius:28px', 'Avatar should have 28px border-radius');
});

test('Design System: Border-radius tokens are correctly defined', () => {
  assertContains(designSystemCss, '--radius-sm: 0.75rem', 'Small radius should be 12px');
  assertContains(designSystemCss, '--radius-md: 1rem', 'Medium radius should be 16px');
  assertContains(designSystemCss, '--radius-lg: 2rem', 'Large radius should be 32px');
  assertContains(designSystemCss, '--radius-xl: 3rem', 'Extra large radius should be 48px');
  assertContains(designSystemCss, '--radius-full: 9999px', 'Full radius should be pill-shaped');
});

test('Design System: Card components use large border-radius', () => {
  assertContains(designSystemCss, 'border-radius: var(--radius-lg)', 'Large cards should use --radius-lg');
  assertContains(designSystemCss, 'border-radius: var(--radius-xl)', 'Extra large cards should use --radius-xl');
});

// ============================================
// Rule 3: Glassmorphic Effects
// ============================================

console.log('\n--- Rule 3: Glassmorphic Effects with Backdrop-Filter ---\n');

test('Login: Card has glassmorphic effect', () => {
  assertContains(loginHtml, 'backdrop-filter:blur(18px)', 'Login card should have backdrop-filter');
  assertContains(loginHtml, '-webkit-backdrop-filter:blur(18px)', 'Should have webkit prefix for Safari');
  assertContains(loginHtml, 'background:rgba(255,255,255,.75)', 'Should have semi-transparent background');
});

test('Profile: Navigation has glassmorphic effect', () => {
  assertContains(profileHtml, 'backdrop-filter:blur(16px)', 'Navigation should have backdrop-filter');
  assertContains(profileHtml, '-webkit-backdrop-filter:blur(16px)', 'Should have webkit prefix');
  assertContains(profileHtml, 'background:rgba(255,248,246,0.75)', 'Should have semi-transparent background');
});

test('Design System: Glassmorphic utilities are defined', () => {
  assertContains(designSystemCss, '.glass {', 'Glass utility class should exist');
  assertContains(designSystemCss, 'backdrop-filter: blur(var(--glass-blur))', 'Should use backdrop-filter');
  assertContains(designSystemCss, '-webkit-backdrop-filter: blur(var(--glass-blur))', 'Should have webkit prefix');
});

test('Design System: Glass blur values are defined', () => {
  assertContains(designSystemCss, '--glass-blur: 16px', 'Glass blur should be 16px');
  assertContains(designSystemCss, '--glass-blur-strong: 20px', 'Strong glass blur should be 20px');
  assertContains(designSystemCss, '--glass-opacity: 0.75', 'Glass opacity should be 75%');
});

test('Design System: Glass card component exists', () => {
  assertContains(designSystemCss, '.glass-card {', 'Glass card component should exist');
  assertContains(designSystemCss, 'background: rgba(255, 255, 255, 0.75)', 'Glass card should have semi-transparent background');
});

// ============================================
// Rule 4: Solid Color Buttons (No Gradients)
// ============================================

console.log('\n--- Rule 4: Solid Color Buttons (No Gradients) ---\n');

test('Login: Submit button uses solid color', () => {
  assertContains(loginHtml, 'background:#FF6D00', 'Submit button should have solid orange background');
  assertNotContains(loginHtml, 'linear-gradient', 'Submit button should not have gradient');
});

test('Profile: Primary buttons use solid color', () => {
  const btnPrimaryMatch = profileHtml.match(/\.btn-primary[^}]*background:[^;]+/);
  if (btnPrimaryMatch) {
    assertNotContains(btnPrimaryMatch[0], 'gradient', 'Primary buttons should not have gradients');
  }
});

test('Design System: Button system uses solid colors', () => {
  assertContains(designSystemCss, 'background: var(--primary)', 'Primary button should use solid color');
  assertNotContains(designSystemCss, 'linear-gradient', 'Primary button should not have gradient in button styles');
});

test('Design System: Secondary buttons use solid colors', () => {
  assertContains(designSystemCss, 'background: var(--surface-container)', 'Secondary button should use solid color');
});

test('Design System: Ghost buttons use transparent background', () => {
  assertContains(designSystemCss, 'background: transparent', 'Ghost button should be transparent');
});

// Note: Avatar uses gradient for visual interest, which is acceptable for non-button elements
test('Profile: Avatar gradient is acceptable (non-button element)', () => {
  assertContains(profileHtml, 'background:linear-gradient(135deg,var(--primary),var(--primary-dark))', 'Avatar can use gradient');
});

// ============================================
// Rule 5: Orange Primary Color
// ============================================

console.log('\n--- Rule 5: Orange Primary Color (#FF6D00) ---\n');

test('Login: Uses orange primary color', () => {
  assertContains(loginHtml, '#FF6D00', 'Login should use #FF6D00 orange');
});

test('Profile: Uses orange primary color', () => {
  assertContains(profileHtml, 'var(--primary)', 'Profile should use --primary variable');
});

test('Design System: Primary color is #FF6D00', () => {
  assertContains(designSystemCss, '--primary: #FF6D00', 'Primary color should be #FF6D00');
});

test('Design System: Primary container color is defined', () => {
  assertContains(designSystemCss, '--primary-container: #fd6c00', 'Primary container should be defined');
});

test('Design System: Primary dark color is defined', () => {
  assertContains(designSystemCss, '--primary-dark: #a14200', 'Primary dark should be defined');
});

test('Login: Language switcher active state uses orange', () => {
  assertContains(loginHtml, '.lang-btn.active{background:#FF6D00', 'Active language button should be orange');
});

test('Profile: Language switcher active state uses orange', () => {
  assertContains(profileHtml, 'background:var(--primary)', 'Active language button should use primary color');
});

// ============================================
// Additional Design System Checks
// ============================================

console.log('\n--- Additional Design System Checks ---\n');

test('Design System: Warm color palette is defined', () => {
  assertContains(designSystemCss, '--surface: #fff8f6', 'Surface should be warm white');
  assertContains(designSystemCss, '--on-surface: #3d2f29', 'Text should be warm dark');
  assertContains(designSystemCss, '--on-surface-variant: #6b5d56', 'Secondary text should be warm');
});

test('Design System: Typography uses Manrope and Plus Jakarta Sans', () => {
  assertContains(designSystemCss, "--font-display: 'Manrope'", 'Display font should be Manrope');
  assertContains(designSystemCss, "--font-body: 'Plus Jakarta Sans'", 'Body font should be Plus Jakarta Sans');
});

test('Login: Loads correct fonts', () => {
  assertContains(loginHtml, 'Manrope:wght@500;600;700;800', 'Should load Manrope font');
  assertContains(loginHtml, 'Plus+Jakarta+Sans:wght@400;500;600;700', 'Should load Plus Jakarta Sans font');
});

test('Profile: Loads correct fonts', () => {
  assertContains(profileHtml, 'Manrope:wght@500;600;700;800', 'Should load Manrope font');
  assertContains(profileHtml, 'Plus+Jakarta+Sans:wght@400;500;600;700', 'Should load Plus Jakarta Sans font');
});

test('Design System: Spacing scale is defined', () => {
  assertContains(designSystemCss, '--space-xs: 0.5rem', 'Extra small spacing should be defined');
  assertContains(designSystemCss, '--space-sm: 0.75rem', 'Small spacing should be defined');
  assertContains(designSystemCss, '--space-md: 1rem', 'Medium spacing should be defined');
  assertContains(designSystemCss, '--space-lg: 1.5rem', 'Large spacing should be defined');
  assertContains(designSystemCss, '--space-xl: 2rem', 'Extra large spacing should be defined');
  assertContains(designSystemCss, '--space-2xl: 3rem', '2XL spacing should be defined');
});

test('Design System: Shadow system is defined', () => {
  assertContains(designSystemCss, '--shadow-sm:', 'Small shadow should be defined');
  assertContains(designSystemCss, '--shadow-md:', 'Medium shadow should be defined');
  assertContains(designSystemCss, '--shadow-lg:', 'Large shadow should be defined');
  assertContains(designSystemCss, '--shadow-xl:', 'Extra large shadow should be defined');
});

test('Design System: Focus ring is defined', () => {
  assertContains(designSystemCss, '--focus-ring: 0 0 0 4px rgba(255, 109, 0, 0.12)', 'Focus ring should be orange with 12% opacity');
});

test('Login: Focus states use orange accent', () => {
  assertContains(loginHtml, 'box-shadow:0 0 0 2px #FF6D00', 'Input focus should use orange');
});

test('Profile: Focus states use orange accent', () => {
  assertContains(designSystemCss, 'box-shadow: 0 0 0 2px var(--primary)', 'Input focus should use primary color');
});

console.log('\n=== Test Summary ===');
console.log(`Total: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ All design system compliance tests passed!');
  console.log('✓ The Radiant Minimalist design system is fully implemented!');
  process.exit(0);
} else {
  console.log('\n✗ Some design system compliance tests failed!');
  process.exit(1);
}
