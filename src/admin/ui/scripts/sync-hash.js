// Post-build script: sync Vite output hashes into admin.html files.
// admin.html lives in BOTH:
//   - src/admin/admin.html  (source, tracked by git)
//   - src/admin/dist/admin.html  (runtime, served by Rust)
// Both must stay in sync with the latest asset hashes.
// In Docker builds, the source file may not exist — only update dist in that case.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../../dist/assets');

// Read dist assets
const files = readdirSync(distDir);
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
const cssFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('Could not find built assets in dist/assets');
  process.exit(1);
}

// Read admin.html from dist location (always available after vite build)
const distAdminHtml = join(__dirname, '../../dist/admin.html');
let html = readFileSync(distAdminHtml, 'utf-8');

// Replace script tag - match any /admin/assets/index-*.js
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.js/, `/admin/assets/${jsFile}`);
// Replace link tag - match any /admin/assets/index-*.css
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.css/, `/admin/assets/${cssFile}`);

// Always write to dist location
writeFileSync(distAdminHtml, html, 'utf-8');

// Also update source location if it exists (local dev only)
const adminHtmlSrc = join(__dirname, '../../admin.html');
if (existsSync(adminHtmlSrc)) {
  writeFileSync(adminHtmlSrc, html, 'utf-8');
  console.log(`Updated: src/admin/admin.html + src/admin/dist/admin.html`);
} else {
  console.log(`Updated: src/admin/dist/admin.html (source file not found, skipping)`);
}

console.log(`Synced hashes -> JS: ${jsFile}, CSS: ${cssFile}`);
