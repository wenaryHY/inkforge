// Post-build script: sync Vite output hashes into the runtime HTML entry.
// Runtime entry now lives at:
//   - src/admin/dist/index.html  (served by Rust)
// Legacy tracked source file kept for compatibility:
//   - src/admin/admin.html
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../../dist/assets');
const distIndexHtml = join(__dirname, '../../dist/index.html');
const legacyAdminHtml = join(__dirname, '../../admin.html');

const files = readdirSync(distDir);
const jsFile = files.find((file) => file.startsWith('index-') && file.endsWith('.js'));
const cssFile = files.find((file) => file.startsWith('index-') && file.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('Could not find built assets in dist/assets');
  process.exit(1);
}

if (!existsSync(distIndexHtml)) {
  console.error('Could not find dist/index.html after vite build');
  process.exit(1);
}

let html = readFileSync(distIndexHtml, 'utf-8');
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.js/, `/admin/assets/${jsFile}`);
html = html.replace(/\/admin\/assets\/index-[A-Za-z0-9_-]+\.css/, `/admin/assets/${cssFile}`);

writeFileSync(distIndexHtml, html, 'utf-8');

if (existsSync(legacyAdminHtml)) {
  writeFileSync(legacyAdminHtml, html, 'utf-8');
  console.log('Updated: src/admin/dist/index.html + src/admin/admin.html');
} else {
  console.log('Updated: src/admin/dist/index.html');
}

console.log(`Synced hashes -> JS: ${jsFile}, CSS: ${cssFile}`);
