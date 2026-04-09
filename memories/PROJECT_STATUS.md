# InkForge 项目现状（唯一真相来源）

**最后更新**: 2026-04-09
**版本**: v0.3.0
**状态**: 开发中

---

## 技术栈

| 层 | 技术 |
|----|------|
| 后端语言 | Rust |
| Web 框架 | Axum 0.7 |
| 数据库 | SQLite (sqlx 0.7) |
| 异步运行时 | Tokio |
| 模板引擎 | MiniJinja |
| 序列化 | serde + serde_json + toml |
| 认证 | JWT (jsonwebtoken) + Argon2 |
| 前端框架 | React 18 + TypeScript |
| 前端构建 | Vite |
| 容器化 | Docker |

---

## 已完成功能

### 核心 CMS
- ✅ 用户认证与授权（JWT + Argon2）
- ✅ 文章管理（CRUD + Markdown 渲染 + FTS5 全文搜索）
- ✅ 评论系统（创建、审核、删除）
- ✅ 分类管理（CRUD）
- ✅ 标签管理（CRUD）

### 媒体系统
- ✅ 媒体上传与管理
- ✅ 媒体分类（6 个默认分类 + 自定义分类 CRUD）
- ✅ 前端 Media 分类 UI（Select、Badge 组件）

### 主题系统
- ✅ 主题扫描与列表
- ✅ 主题激活与切换
- ✅ 主题详情查看
- ✅ 主题配置保存（schema → 数据库）
- ✅ 主题 zip 上传（含 theme.toml 校验）
- ✅ 前台主题渲染（MiniJinja 动态加载 + SSR 数据注入）

### 备份与恢复
- ✅ 本地备份（数据库 + 媒体文件打包为 zip）
- ✅ 备份恢复（上传 zip 恢复）
- ✅ 定时备份调度（tokio-cron-scheduler）
- ✅ 备份列表、删除、下载
- ✅ 统一回收站系统（支持文章、分类、标签、媒体、媒体分类、评论的软删除与恢复）
- ✅ 自动化灾难恢复配置（支持 1-90 天过期清理、自定义清理时间点、带滚轮动画的 TimePicker UI）
- ⚠️ S3 备份声明支持但运行时未接线

### SEO
- ✅ Sitemap 生成
- ✅ Robots.txt 配置
- ✅ Meta 标签构建器已全部接入前台页面渲染

### 实时通知
- ✅ WebSocket（管理员通知 + 公开事件）

### 管理后台（React）
- ✅ 10 个页面：Posts、Categories、Tags、Comments、Settings、Upload、MediaCategories、Themes、ThemeDetail、Login
- ✅ 16 个通用组件
- ✅ 主题切换（Orange 风格）

---

## 已有但未接入的代码

这些代码已编写但未被路由或业务调用：

| 模块 | 文件 | 状态 |
|------|------|------|
| 插件系统 | `infra/plugin/` | 纯接口占位，无实现 |
| 存储后端 | `infra/storage/` | 抽象层占位，实际用直接文件 I/O |
| S3 备份 | `infra/backup/s3.rs` | 编译通过但运行时未使用 |

---

## 项目结构

```
inkforge/
├── src/
│   ├── main.rs              # 入口
│   ├── state.rs             # AppState
│   ├── ws.rs                # WebSocket
│   ├── admin/               # 管理后台（React 构建产物 + 源码）
│   ├── bootstrap/           # 配置与路由
│   ├── infra/               # 基础设施（db, jwt, hash, backup, plugin, storage）
│   ├── modules/             # 11 个业务模块
│   └── shared/              # 错误、认证、分页、响应
├── migrations/              # 6 个 SQL 迁移文件
├── themes/default/          # 默认主题（templates + static）
├── config/default.toml      # 默认配置
├── uploads/                 # 上传文件
├── backups/                 # 备份存储
└── memories/                # 项目文档（本目录）
```

---

## API 端点总览（39 个）

### 公开 API
- `GET  /api/health` / `GET /api/version`
- `POST /api/auth/register` / `POST /api/auth/login` / `POST /api/auth/logout`
- `GET  /api/me` / `PATCH /api/me/profile` / `PATCH /api/me/password`
- `GET  /api/posts` / `GET /api/search` / `GET /api/posts/:slug`
- `GET  /api/categories` / `GET /api/tags`
- `GET  /api/themes/active`
- `GET  /sitemap.xml` / `GET /robots.txt`

### 管理 API
- 文章: CRUD + 列表
- 评论: 列表 + 审核 + 删除
- 分类/标签: CRUD
- 媒体: 上传 + 列表 + 删除 + 重命名 + 分类管理
- 主题: 列表 + 详情 + 配置 + 上传 + 激活
- 设置: 列表 + 更新（含回收站自动清理配置）
- 备份: 创建 + 列表 + 恢复 + 调度 + 删除 + 下载
- 回收站: 跨模块列表查询 + 恢复 + 彻底删除 + 过期自动清理调度

### WebSocket
- `GET /ws/admin` / `GET /ws/public`

---

## 长期路线图

参见 [v0.3-architecture-vision.md](./v0.3-architecture-vision.md) 与 [executable-roadmap.md](./executable-roadmap.md)

核心方向：**Headless Rust Core + Web-Based Theme Engine + Tauri 桌面应用**

### 近期优先级（v0.3 → v0.4）
1. ✅ 前台主题渲染打通（已完成）
2. 安装向导
3. 插件系统最小可用
4. Tauri 集成

### 中期规划（v0.5+）
1. JavaScript SDK (window.cms.*)
2. 主题生态与市场
3. 性能优化
4. 安全加固

### 治理与执行文档（2026-04-09）
- `executable-roadmap.md` - 面向落地的分阶段执行路线图
- `phase-task-checklist.md` - 各 Phase 的可勾选任务清单
- `RUNTIME_RULES.md` - 每次会话的提问、风险分级与执行协议

---

## 开发指南

### 运行
```bash
cargo run                    # 启动服务器（默认 :3000）
```

### 构建
```bash
cargo build --release        # 生产构建
docker build -t inkforge .   # Docker 构建
```

### 添加新模块
1. `src/modules/<name>/` 下创建 domain、dto、repository、service、handler
2. 在 `src/modules/mod.rs` 中 pub mod
3. 在 `src/bootstrap/router.rs` 中注册路由
4. 如需数据库表，在 `migrations/` 添加新迁移
