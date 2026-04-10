# InkForge 项目现状（唯一真相来源）

**最后更新**: 2026-04-10  
**版本**: v0.3.5  
**状态**: 开发中（Web 主链路已可用，`Phase 3A` 进行中，`Phase 3B` 待验收）

---

## 一句话结论

InkForge 当前已经是一个**功能面较完整的 Web 优先单体 CMS**；真正卡住后续演进的，不是“还缺多少功能”，而是 **内容安全边界、备份 / 部署路径坐标、Tauri 验收闭环** 还没有完全收敛。

---

## 当前技术基线（已核对代码）

| 层 | 技术 | 状态 |
|---|---|---|
| 后端 | Rust + Axum 0.7 + sqlx 0.7 + SQLite | 已落地 |
| 前端 | React 19 + TypeScript + Vite 8 | 已落地 |
| 编辑器 | Tiptap + CodeMirror 6 | 已落地 |
| 模板渲染 | MiniJinja | 已落地 |
| 搜索 | SQLite FTS5 | 已落地，公开搜索契约已校正 |
| 桌面壳 | Tauri 2 | 已有骨架，未通过验收 |

---

## 已验证落地的能力

### 内容与后台
- ✅ 认证与授权（JWT + Argon2）
- ✅ `post | page` 双内容类型
- ✅ `page_render_mode`（`editor | custom_html`）
- ✅ Tiptap 编辑器 + CodeMirror 源码模式
- ✅ `/api/v1/...` 正式接口 + 旧 `/api/...` 兼容层
- ✅ React 管理后台与中英文切换

### 安装向导
- ✅ `setup` 模块（handler / service / repository）
- ✅ `not_started / admin_created / configured / completed` 四阶段状态模型
- ✅ 空库时 `/` 与 `/admin` 自动引导到 `/setup`
- ✅ Web 首装流程：站点信息、管理员初始化、后台入口配置
- ✅ 安装完成后的运行态缓存刷新与旧库状态回填

### 主题与前台
- ✅ 主题扫描、详情、激活、配置保存
- ✅ 主题 ZIP 上传与路径校验
- ✅ MiniJinja 前台主题渲染
- ✅ Sitemap、Robots、Meta / OpenGraph / JSON-LD 接入
- ✅ 默认主题前台评论实时更新链路

### 媒体、备份、运维
- ✅ 媒体上传、分类、重命名、删除
- ✅ 本地备份、恢复、调度、下载、删除
- ✅ 统一回收站与过期清理调度
- ✅ WebSocket 管理员 / 公开事件通道
- ✅ `/api/v1/health` 与 `/api/v1/version`

---

## 已完成的基线加固（代码已存在）

以下事项已经落在真实代码中，不应再被记为“未开始”：

- ✅ 生产环境默认 JWT secret 已可阻断，除非显式开启不安全模式
- ✅ 管理端已改为 **HttpOnly Cookie Session + 内存占位 token**，不再长期依赖 `localStorage` 存放真实 JWT
- ✅ 登录链路已有内存级限流器
- ✅ 通用安全响应头中间件已接入
- ✅ 主题 ZIP 解压已做 `enclosed_name()` 路径保护
- ✅ Markdown 渲染输出已在服务端完成 sanitize
- ✅ 公开注册已复用 setup 完成态守卫，且首个管理员只能由安装向导创建
- ✅ 登录页已按 `/setup/status` 动态决定跳转 `/setup` 与是否展示注册入口
- ✅ 管理后台内部导航已收敛到 `/admin/*`，不再因根路径跳转丢失页面与 query
- ✅ `Settings.tsx` 中回收站保留天数与清理时间已接通真实保存链路
- ✅ `me/profile` 已按字段合并更新，未提交字段不会再被默认值覆盖
- ✅ 公开搜索已修复 `tag_id` 过滤与 `pagination.total` 真实总数契约
- ✅ 全局 request_id 中间件已接入，响应体与响应头会复用同一追踪 ID

---

## 已存在但未完成验收的部分

### Phase 3A：基线加固与验收补齐
当前阶段不再是“补多少新功能”，而是收敛以下主链路边界：
- `custom_html`、主题模板 `safe` 输出与通用 CSP 的内容安全边界
- legacy `/api` 兼容层退出路径
- 备份、部署与静态入口路径统一

### Phase 3B：Tauri 运行壳
当前仓库已存在 `src-tauri/`，并且已经尝试接入：
- workspace 成员
- sidecar 生命周期代码
- setup 页到 admin 页的 Tauri IPC 跳转
- 窗口管理与启动入口骨架

但 **尚未通过阶段验收**，原因至少包括：
- `cargo check --workspace` 当前失败
- `src-tauri` 依赖与 manifest 仍未完全闭环
- sidecar 资源、打包与 dev / prod 一致性未验证完成
- setup 状态字段读取与后端 DTO 存在不匹配风险

**结论**：`Phase 3B` 只能记为“进行中 / 待验收”，不能记为“已完成”。

---

## 当前明确风险

### 1. API 兼容层仍待收敛
- 默认主题前台仍真实依赖 legacy `/api/...`
- legacy `/api` 的退出顺序与弃用策略仍未明确

### 2. 内容安全边界尚未收口
- Markdown 渲染 sanitize 已完成，但 `custom_html` 仍是高信任同源执行模型
- 默认主题模板对 `post.content_html` 使用 `safe`
- Web 主链路仍缺少通用 CSP

### 3. 备份 / 部署 / 静态入口坐标不一致
- 备份服务、备份下载、Docker 与 Litestream 使用的路径坐标不完全一致
- `parse_sqlite_url()` 仍存在绝对路径解析风险
- 后台静态入口仍存在 `index.html / admin.html` 语义漂移

### 4. Tauri setup 状态字段读取不匹配
- 后端响应字段是 `data.stage`
- Tauri sidecar 当前读取的是 `data.setup_stage`

### 5. 验收与可观测性仍偏弱
- 请求追踪链路虽已打通，但仍缺少面向主链路的回归验收项
- 仓库缺少稳定的前端测试与基础 CI workflow

---

## 当前架构判断

### 已经稳定的边界
- Rust 单体业务内核仍是唯一真相源
- Web 安装向导是未来桌面安装体验的唯一逻辑来源
- `/api/v1` 已是正式契约层
- React 管理后台是当前唯一官方后台 UI
- Markdown 渲染 sanitize 已进入真实服务链路

### 仍需收敛的边界
- legacy `/api` 的迁移退出路径
- `custom_html` / theme `safe` / CSP 的内容安全边界
- 备份、恢复、Docker、Litestream 的统一路径坐标
- Tauri 启动模型、窗口模型与 sidecar 打包方案

---

## 最近审计入口

- 详细结构化审计见 `architecture-audit-2026-04-10.md`

---

## 近期优先级（按建议执行顺序）

1. **收口 `custom_html`、主题模板与 CSP 的内容安全边界**
2. **统一备份 / 部署 / 静态入口路径坐标，并明确 legacy `/api` 的退出路径**
3. **修复 Tauri setup 状态读取并恢复 `Phase 3B` 验收**
4. **为 Web 主链路补最小回归验收与 CI 入口**
5. **在验收体系稳定前，不继续前推插件系统**

---

## 仓库事实（2026-04-10）

- 默认后端端口：`2000`
- 默认 Vite 开发端口：`5173`
- 迁移文件：`001` 到 `013`
- 根仓库当前已声明 workspace，并包含 `src-tauri/`
- `src-tauri/` 当前属于**实验性骨架**而非稳定交付物

---

## 文档使用说明

- 想知道**现在是什么状态**，看本文件。
- 想知道**为什么这样设计**，看 `architecture-decisions.md`。
- 想知道**接下来怎么推进**，看 `executable-roadmap.md` 与 `phase-task-checklist.md`。
- 想知道**审计里发现了什么**，看 `architecture-audit-2026-04-10.md`。
- 想知道**历史上真实完成过什么**，看 `v0.3-progress.md`。
