# Package Versions
> 生成时间：2026-04-12
> 规则：新增依赖必须使用**精确版本**（Cargo 使用 `=x.y.z`，npm 使用 `x.y.z`）。

## Root Node.js Dependencies (`package.json`)
```json
{
  "dependencies": {
    "sharp": "0.34.5"
  },
  "devDependencies": {
    "@tauri-apps/cli": "2.10.1",
    "concurrently": "9.2.1",
    "wait-on": "8.0.5"
  }
}
```

## Frontend UI Dependencies (`src/admin/ui/package.json`)
```json
{
  "dependencies": {
    "@codemirror/commands": "6.10.3",
    "@codemirror/lang-markdown": "6.5.0",
    "@codemirror/language": "6.12.3",
    "@codemirror/state": "6.6.0",
    "@codemirror/view": "6.41.0",
    "@fontsource/inter": "5.2.8",
    "@fontsource/manrope": "5.2.8",
    "@tauri-apps/api": "2.10.1",
    "@tiptap/extension-image": "3.22.3",
    "@tiptap/extension-placeholder": "3.22.3",
    "@tiptap/extension-task-item": "3.22.3",
    "@tiptap/extension-task-list": "3.22.3",
    "@tiptap/pm": "3.22.3",
    "@tiptap/react": "3.22.3",
    "@tiptap/starter-kit": "3.22.3",
    "lucide-react": "1.7.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-router-dom": "7.14.0",
    "tiptap-markdown": "0.9.0"
  },
  "devDependencies": {
    "@eslint/js": "9.39.4",
    "@tailwindcss/vite": "4.2.2",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@types/node": "24.12.2",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.1",
    "@vitest/ui": "4.1.4",
    "eslint": "9.39.4",
    "eslint-plugin-react-hooks": "7.0.1",
    "eslint-plugin-react-refresh": "0.5.2",
    "fast-check": "4.6.0",
    "globals": "17.4.0",
    "jsdom": "29.0.2",
    "tailwindcss": "4.2.2",
    "typescript": "5.9.3",
    "typescript-eslint": "8.58.0",
    "vite": "8.0.3",
    "vitest": "4.1.4"
  }
}
```

## E2E Dependencies (`e2e/package.json`)
```json
{
  "devDependencies": {
    "@playwright/test": "1.59.1"
  }
}
```

## Theme Frontend Test Dependencies (`themes/default/static/js/package.json`)
```json
{
  "devDependencies": {
    "fast-check": "3.23.2",
    "jsdom": "24.1.3"
  }
}
```

## Backend Rust Dependencies (`Cargo.toml`)
```json
{
  "dependencies": {
    "ammonia": "4.1.2",
    "anyhow": "1.0.102",
    "argon2": "0.5.3",
    "aws-config": "1.8.15",
    "aws-sdk-s3": "1.119.0",
    "axum": "0.7.9",
    "axum-extra": "0.9.6",
    "bytes": "1.11.1",
    "chrono": "0.4.44",
    "config": "0.14.1",
    "futures-util": "0.3.32",
    "hex": "0.4.3",
    "jsonwebtoken": "9.3.1",
    "mime_guess": "2.0.5",
    "minijinja": "2.19.0",
    "once_cell": "1.21.4",
    "pulldown-cmark": "0.11.3",
    "rand_core": "0.6.4",
    "serde": "1.0.228",
    "serde_json": "1.0.149",
    "sha2": "0.10.9",
    "slug": "0.1.6",
    "sqlx": "0.7.4",
    "thiserror": "1.0.69",
    "tokio": "1.51.0",
    "tokio-cron-scheduler": "0.9.4",
    "toml": "0.8.2",
    "tower": "0.4.13",
    "tower-http": "0.5.2",
    "tracing": "0.1.44",
    "tracing-subscriber": "0.3.23",
    "url": "2.5.8",
    "uuid": "1.23.0",
    "zip": "2.4.2"
  },
  "devDependencies": {
    "reqwest": "0.12.28",
    "serial_test": "3.4.0"
  }
}
```

## Tauri Desktop Rust Dependencies (`src-tauri/Cargo.toml`)
```json
{
  "dependencies": {
    "tauri": "2.10.3",
    "tauri-plugin-shell": "2.3.5",
    "reqwest": "0.12.28",
    "tokio": "1.51.0",
    "serde": "1.0.228",
    "serde_json": "1.0.149",
    "tracing": "0.1.44"
  },
  "buildDependencies": {
    "tauri-build": "2.5.6"
  }
}
```
