// Post-build script: sync Vite output hashes into admin.html files.
// admin.html lives in BOTH:
//   - src/admin/admin.html  (source, tracked by git)
//   - src/admin/dist/admin.html  (runtime, served by Rust)
// Both must stay in sync with the latest asset hashes.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
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

// Read admin.html from source location
const adminHtmlSrc = join(__dirname, '../../admin.html');
let html = readFileSync(adminHtmlSrc, 'utf-8');

// Replace script tag - match any /admin/assets/index-*.js
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.js/, `/admin/assets/${jsFile}`);
// Replace link tag - match any /admin/assets/index-*.css
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.css/, `/admin/assets/${cssFile}`);

// Write to BOTH locations
writeFileSync(adminHtmlSrc, html, 'utf-8');
const distAdminHtml = join(__dirname, '../../dist/admin.html');
writeFileSync(distAdminHtml, html, 'utf-8');

console.log(`Synced hashes -> JS: ${jsFile}, CSS: ${cssFile}`);
console.log(`Updated: src/admin/admin.html + src/admin/dist/admin.html`);
