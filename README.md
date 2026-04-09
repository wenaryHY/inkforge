# 🖋️ InkForge（墨炉）

> 用 Rust 从零构建的现代化博客平台。Axum + SQLite + React，单体二进制，零依赖部署。

## ✨ 功能特性

- 📝 **文章与页面** — 支持 post/page 双内容类型，页面可同时拥有 Markdown 和自定义 HTML
- ✏️ **双模式编辑器** — Tiptap 所见即所得 + CodeMirror 源码模式，自由切换
- 📁 **分类 & 标签** — 层级分类，多标签关联
- 💬 **评论系统** — 审核流程，WebSocket 实时推送
- 🖼️ **媒体管理** — 本地存储，分类整理，支持图片/音频
- 🔐 **用户认证** — Argon2 密码加密 + JWT Token
- 🎨 **主题系统** — minijinja 模板引擎，支持可视化配置
- 🔍 **全文搜索** — FTS5 增量索引
- 🗑️ **统一回收站** — 文章/分类/标签/评论统一管理，定时清理
- 📡 **SEO** — Sitemap、Robots.txt、OpenGraph / JSON-LD 元数据
- 💾 **备份与恢复** — 本地备份，一键还原
- 🌐 **API 版本化** — `/api/v1/` 规范路由，旧路由兼容降级

## 🛠️ 技术栈

| 模块 | 技术 |
|---|---|
| Web 框架 | Axum 0.7 |
| 运行时 | Tokio |
| 数据库 | SQLite (sqlx 0.7) |
| 模板引擎 | minijinja |
| 认证 | JWT + Argon2 |
| 管理后台 | React 18 + TypeScript + Vite |
| Markdown 编辑器 | Tiptap + tiptap-markdown |
| Markdown 渲染 | pulldown-cmark |
| 全文搜索 | SQLite FTS5 |

## 🚀 快速开始

### 环境要求

- Rust 1.75+（`rustup default stable`）
- Node.js 18+（仅修改后台 UI 时需要）

### 编译运行

```bash
# 克隆项目
git clone https://github.com/wenaryHY/inkforge.git
cd inkforge

# 编译（首次需要下载依赖，约 2~5 分钟）
cargo build --release

# 运行
cargo run --release
```

### 访问地址

- 前台首页：`http://localhost:3000`
- 管理后台：`http://localhost:3000/admin`
- 默认端口：3000（可在 `config/default.toml` 中修改）

### 修改后台 UI

```bash
cd src/admin/ui
npm install
npm run dev       # 开发模式（热重载）
npm run build     # 构建生产版本
```

构建完成后，重新 `cargo build --release` 即可。

---

## 📁 项目结构

```
inkforge/
├── src/
│   ├── main.rs              # 程序入口
│   ├── bootstrap/           # 路由组装
│   ├── config.rs            # 配置加载（TOML + 环境变量）
│   ├── db.rs                # 数据库连接与迁移
│   ├── error.rs             # 统一错误处理
│   ├── modules/
│   │   ├── auth/            # 认证（handler → service → repository）
│   │   ├── post/            # 文章/页面
│   │   ├── comment/         # 评论
│   │   ├── category/        # 分类
│   │   ├── tag/             # 标签
│   │   ├── media/           # 媒体管理
│   │   ├── theme/           # 主题渲染
│   │   ├── seo/             # SEO（sitemap, meta）
│   │   ├── setting/         # 系统设置
│   │   └── backup/          # 备份恢复
│   └── admin/ui/            # React 管理后台源码
├── migrations/              # SQL 迁移文件
├── config/                  # TOML 配置文件
├── themes/                  # 前台主题（minijinja 模板）
└── uploads/                 # 上传文件目录
```

---

## ⚙️ 配置说明

通过 `config/default.toml` 或环境变量覆盖：

```toml
[server]
host = "0.0.0.0"
port = 3000

[jwt]
secret = "your-secret-key-change-in-production"

[database]
url = "sqlite://data.db"
```

```bash
# 环境变量覆盖
export INKFORGE__SERVER__PORT=8080
export INKFORGE__JWT__SECRET=your-secret-key
```

---

## 🔮 路线图

- [x] WebSocket 实时评论通知
- [x] React 管理后台
- [x] 页面双内容模型（Markdown + 自定义 HTML）
- [x] Tiptap 编辑器
- [x] 全文搜索（FTS5）
- [x] 统一回收站
- [x] SEO（Sitemap + OpenGraph + JSON-LD）
- [x] 备份与恢复
- [ ] 安装向导
- [ ] 插件系统（WASM）
- [ ] S3/OSS 对象存储适配
- [ ] 多语言支持
- [ ] Tauri 桌面客户端

---

**License**: MIT
