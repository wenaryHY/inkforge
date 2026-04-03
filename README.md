# 🖋️ InkForge（墨炉）

> 用 Rust 从零构建的现代化开源博客平台，参考 Halo / WordPress 的核心设计理念。

## ✨ 功能特性

- 📝 **文章管理** — Markdown 编辑，支持草稿/发布状态，自动生成摘要
- 📁 **分类 & 标签** — 层级分类，多标签关联
- 💬 **评论系统** — 支持审核流程，WebSocket 实时推送
- 🖼️ **文件上传** — 本地存储，自动命名
- 🔐 **用户认证** — Argon2 密码加密 + JWT Token
- ⚙️ **系统设置** — 可视化配置站点信息
- 🎨 **主题系统** — Jinja2 模板引擎
- 🔌 **模块化架构** — 路由分层，易于扩展

## 🛠️ 技术栈

| 模块 | 技术 |
|---|---|
| Web 框架 | Axum 0.7 |
| 运行时 | Tokio |
| 数据库 | SQLite (sqlx) |
| 模板引擎 | minijinja |
| 认证 | JWT + Argon2 |
| 管理后台 | React 18 + TypeScript + Tailwind CSS v4 |
| Markdown | pulldown-cmark |

## 🚀 快速开始

### 环境要求

- Rust 1.75+（`rustup default stable`）
- Node.js 18+（仅修改后台 UI 时需要）
- Windows / macOS / Linux

### 编译运行

```bash
# 克隆项目
cd D:\InkForge

# 编译（首次需要下载依赖，约 2~5 分钟）
cargo build --release

# 运行
cargo run --release
# 或者直接运行编译好的程序
.\target\release\inkforge.exe
```

### 访问地址

- 前台首页：`http://localhost:3000`
- 管理后台：`http://localhost:3000/admin`
- 默认端口：3000（可在 `config/default.toml` 中修改）

---

## 🔐 管理后台使用指南

### 登录

1. 打开 `http://localhost:3000/admin`
2. 输入用户名和密码，点击**登录**

> 首次使用需要先注册账号（见下方"注册"章节）

### 注册

1. 在登录页面点击**"没有账号？注册"**
2. 填写用户名、邮箱、密码和显示名称
3. 点击**创建账户**

> ⚠️ 首个注册用户自动获得管理员权限，可以管理所有内容

### 退出登录

1. 在管理后台任意页面，点击左下角**退出**按钮（Logout 图标）
2. 确认后返回登录页面

---

## 📡 API 速查

### 认证

```bash
# 注册（首个注册用户自动成为 admin）
POST /api/auth/register
Body: { "username": "admin", "email": "a@b.com", "password": "123456", "display_name": "管理员" }

# 登录
POST /api/auth/login
Body: { "username": "admin", "password": "123456" }
# 返回: { "code": 0, "data": { "token": "eyJ..." } }
```

### 文章

```bash
# 获取文章列表（公开，仅已发布内容）
GET /api/posts?page=1&size=10

# 获取单篇文章（公开）
GET /api/posts/{id_or_slug}

# 新建文章（需登录）
POST /api/posts
Header: Authorization: Bearer {token}
Body: { "title": "Hello Rust", "content": "# Hello\nWorld!", "status": "published", "category_id": "...", "tag_ids": ["..."] }

# 更新文章
PUT /api/posts/{id}

# 删除文章
DELETE /api/posts/{id}
```

### 分类 & 标签

```bash
GET    /api/categories           # 列表（公开）
POST   /api/categories           # 新建（需登录）
PUT    /api/categories/{id}      # 更新（需登录）
DELETE /api/categories/{id}      # 删除（需登录）

GET    /api/tags                 # 列表（公开）
POST   /api/tags                 # 新建（需登录）
DELETE /api/tags/{id}            # 删除（需登录）
```

### 评论

```bash
GET    /api/comments?post_id=xxx       # 列表（公开）
POST   /api/comments                   # 提交（公开）
PUT    /api/comments/{id}/approve      # 审核通过（需登录）
DELETE /api/comments/{id}              # 删除（需登录）
```

### 设置

```bash
GET    /api/settings                  # 公开设置（前台用）
GET    /api/admin/settings             # 全部设置（需登录）
PUT    /api/admin/settings             # 更新设置（需 admin）
Body: { "key": "site_title", "value": "My Blog" }
```

### 文件上传

```bash
POST /api/upload
Content-Type: multipart/form-data
Body: file=@image.png
# 返回: { "code": 0, "data": { "url": "/uploads/xxx.png", "filename": "xxx.png" } }
```

---

## 📁 项目结构

```
InkForge/
├── src/
│   ├── main.rs          # 程序入口、路由组装、AppState
│   ├── config.rs        # 配置加载（TOML + 环境变量）
│   ├── db.rs            # 数据库连接与迁移
│   ├── error.rs         # 统一错误处理
│   ├── models/          # 数据模型
│   ├── handlers/        # 业务逻辑（auth/post/category/tag/comment/setting/upload）
│   ├── middleware/      # JWT 认证中间件
│   ├── routes/          # 路由定义
│   ├── admin.rs         # 后台管理 React SPA 路由（含 include_str! 内嵌 HTML）
│   └── admin/
│       ├── admin.html   # React SPA 入口模板（通过 include_str! 嵌入二进制）
│       ├── ui/          # React 源码（开发时使用）
│       │   ├── src/
│       │   │   ├── App.tsx
│       │   │   ├── main.tsx
│       │   │   ├── index.css
│       │   │   ├── components/   # 可复用 UI 组件
│       │   │   ├── pages/         # 各功能页面
│       │   │   ├── contexts/      # AuthContext, ToastContext
│       │   │   └── lib/           # API 调用封装
│       │   ├── package.json
│       │   └── vite.config.ts
│       └── dist/         # Vite 构建产物（已嵌入二进制，无需单独部署）
├── migrations/           # SQL 迁移文件
├── config/               # TOML 配置文件
├── themes/               # 前台主题文件（minijinja 模板）
├── uploads/              # 上传文件目录（运行时自动创建）
└── data.db               # SQLite 数据库文件（运行时自动创建）
```

### 修改后台 UI

如果需要修改管理后台的界面：

```bash
cd src/admin/ui

# 安装依赖（仅首次）
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本（自动同步到 ../admin.html）
npm run build
```

构建完成后，重新 `cargo build --release` 即可。

---

## ⚙️ 配置说明

通过 `config/default.toml` 或环境变量覆盖：

```bash
# config/default.toml 示例
[server]
host = "0.0.0.0"
port = 3000

[jwt]
secret = "your-secret-key-change-in-production"

[database]
url = "sqlite://data.db"

[paths]
theme_static_dir = "themes/default/static"
admin_dist_dir = "src/admin/dist"
```

```bash
# 环境变量覆盖示例
export INKFORGE__SERVER__PORT=8080
export INKFORGE__JWT__SECRET=your-secret-key
export INKFORGE__DATABASE__URL=sqlite://blog.db
```

---

## 🔮 未来计划

- [x] WebSocket 实时评论通知
- [x] React 管理后台
- [ ] 全文搜索（tantivy）
- [ ] S3/OSS 对象存储适配
- [ ] 插件系统（WASM）
- [ ] 多语言支持

---

**License**: MIT
