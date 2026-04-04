// Post-build script: sync Vite output hashes into src/admin/admin.html
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

// Read admin.html (sibling to dist/)
const adminHtmlPath = join(__dirname, '../../admin.html');
let html = readFileSync(adminHtmlPath, 'utf-8');

// Replace script tag - match any /admin/assets/index-*.js
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.js/, `/admin/assets/${jsFile}`);
// Replace link tag - match any /admin/assets/index-*.css
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.css/, `/admin/assets/${cssFile}`);

writeFileSync(adminHtmlPath, html, 'utf-8');
console.log(`Synced hashes -> JS: ${jsFile}, CSS: ${cssFile}`);
