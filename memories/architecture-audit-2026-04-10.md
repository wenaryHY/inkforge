# InkForge 架构审计报告（2026-04-10）

> 审计目标：基于仓库中的**真实代码、配置与前后台实现**，评估 InkForge 当前架构成熟度、边界一致性、风险项与建议推进顺序。
> 审计结论不以旧文档自述为准，而以当前源码、配置、默认主题与运行链路为准。

---

## 一、执行摘要

InkForge 当前已经具备一个 **Web 优先单体 CMS** 的主架构：Rust 单体内核、React 管理后台、MiniJinja 前台主题层、SQLite 数据层、以及一个仍处于实验状态的 Tauri 壳。内容管理、安装向导、主题渲染、备份恢复、SEO、回收站与基础实时通知都已进入主链路。

当前真正影响后续开发效率与交付质量的，不再是“功能够不够多”，而是**边界是否收口、契约是否一致、文档是否跟上真实实现**。本轮复核后，关键结论如下：

1. **数据库迁移主入口已经收敛**到 `src/main.rs` 中的 `sqlx::migrate!("./migrations")`，但 `src/db.rs` 与 `src/infra/db/pool.rs` 仍保留了只覆盖早期迁移的旧入口，容易误导后续维护。
2. **`/api/v1` 已是正式契约层**，但默认主题前台仍真实依赖 legacy `/api/*`；兼容层不是空壳，短期不能按“可直接删除”处理。
3. **setup / auth 边界仍未完全闭合**：`login()` 已阻断未安装状态，但 `register()` 仍可能绕过安装完成约束，且空库首个公开注册用户仍可能获得 `admin`。
4. **Markdown 渲染输出的 sanitize 已经落地**，旧的“待补齐”结论已失效；当前真正未收口的内容安全边界在于 `custom_html`、主题模板 `safe` 输出以及全局缺失通用 CSP。
5. **管理后台的一致性问题仍存在**：后台路由前缀、设置页写链路、`me/profile` 的伪 PATCH 语义都还没有完全收口。
6. **搜索契约存在实质性正确性问题**：`tag_id` 暴露但未真正参与过滤，`pagination.total` 当前等于 `items.len()`，不代表真实总数。
7. **可观测性已起步但 request-id 还未闭环**：前端会发送 `X-Client-Request-Id`，后端也有健康检查和 tracing，但响应里的 `request_id` 仍是重新生成的 UUID。
8. **备份、下载、Docker、Litestream 与 SQLite URL 解析仍不在同一坐标系**，会持续放大恢复、部署与运维成本。
9. **Tauri 仍是实验性骨架**，`data.stage` / `data.setup_stage` 契约错位尚未修复，不能按“已完成能力”记账。
10. **自动化测试与 CI 基本缺位**，这也是当前阶段验收迟迟无法闭环的重要原因。

**总体评级**：
- **架构方向**：良好
- **实现完整度**：中高
- **边界一致性**：中
- **验收成熟度**：中低
- **当前可扩展性**：受限于主链路未收口

---

## 二、审计范围与证据来源

### 代码范围
- 后端启动与调度：`src/main.rs`
- 配置、路由与中间件：`src/bootstrap/config.rs`、`src/bootstrap/router.rs`
- 全局状态与共享能力：`src/state.rs`、`src/shared/response.rs`、`src/shared/request_id.rs`、`src/shared/security.rs`、`src/shared/auth.rs`
- 核心业务模块：`setup`、`auth`、`post`、`comment`、`theme`、`backup`、`setting`、`trash`
- React 管理后台：`src/admin/ui/src/lib/api.ts`、`contexts/AuthContext.tsx`、`hooks/useWebSocket.ts`、`pages/*.tsx`
- 默认前台主题：`themes/default/templates/*.html`、`themes/default/static/js/*.ts`
- Tauri：`src-tauri/src/sidecar.rs`、`src-tauri/src/window.rs`、`src-tauri/tauri.conf.json`
- 部署与运行配置：`README.md`、`Dockerfile`、`docker-compose.yml`、`config/litestream.yml`

### 文档范围
- `PROJECT_STATUS.md`
- `phase-task-checklist.md`
- `INTEGRATION_TEST_CHECKLIST.md`
- `v0.3-progress.md`
- 根 `README.md`

### 关键证据摘要
- 真实迁移入口：`sqlx::migrate!("./migrations").run(&pool).await?;`
- 旧迁移入口残留：`src/db.rs`、`src/infra/db/pool.rs`
- 内容 sanitize 已落地：`ammonia::clean(&html_out)`
- 搜索总数当前计算：`let total = items.len() as i64;`
- SQLite URL 解析风险：`let path = path.trim_start_matches('/')`
- 管理后台发送请求追踪头：`headers.set('X-Client-Request-Id', clientRequestId)`
- 响应 request-id 仍单独生成：`request_id: Uuid::new_v4().to_string()`
- 默认主题仍走 legacy 搜索：`fetch('/api/search?...')`
- Tauri sidecar 读取 `data.setup_stage`，后端 DTO 实际字段为 `data.stage`

---

## 三、当前系统形态判断

### 3.1 主体形态

InkForge 当前的真实主体不是“桌面优先产品”，而是：

- **Rust 单体业务内核**
- **React 管理后台**
- **MiniJinja 驱动的 Web 前台主题层**
- **仍处于实验阶段的 Tauri 分发壳**

当前最稳定的事实边界依然是：

```text
Rust API + SQLite + React Admin + MiniJinja Theme
```

### 3.2 当前阶段的真实瓶颈

当前瓶颈已经从“模块是否存在”切换到：

- 边界是否一致
- 契约是否统一
- 默认主题与后台是否共用同一事实
- 部署 / 备份 / 恢复是否在同一坐标系里工作
- 验收与回归机制是否足够支撑后续复杂度

### 3.3 当前阶段的判断

InkForge 已经走到一个很典型的拐点：**核心能力已经足够多，继续堆功能的收益开始低于收口边界和补齐验收的收益**。如果不先把边界问题解决，再往插件系统、主题构建链和桌面态推进，后续维护成本会快速放大。

---

## 四、已验证的架构优点

### 4.1 后端主分层方向是成立的

核心模块大体遵循 `handler -> service -> repository` 分层，业务逻辑、路由提取与数据访问在大部分主模块中已经分开。这是当前后端最应继续坚持的基础。

### 4.2 setup 已成为唯一安装逻辑来源

`setup` 模块已经具备状态机、初始化、缓存回填、重复安装保护与首页 / 后台入口统一切换逻辑。无论未来是 Web 还是桌面，这条安装链路都应继续作为唯一真相源。

### 4.3 安全基线已有真实落地

经代码复核，以下基线已经真实存在：

- 生产环境默认 JWT secret 可阻断
- 管理端已切换到 **HttpOnly Cookie Session + 内存占位 token**
- 登录链路已有内存级限流器
- 通用安全响应头中间件已接入
- 主题 ZIP 解压已通过 `enclosed_name()` 做路径保护
- Markdown 渲染输出已接入服务端 sanitize

这说明项目的安全状态不是“完全没有基线”，而是**已有一部分落实到代码，但文档与验收没有及时追上**。

### 4.4 主题与前台渲染边界相对清晰

主题扫描、激活、配置保存、模板渲染和静态资源服务已经形成独立能力。MiniJinja 作为 SSR 模板边界本身是稳定的，前台主题也能获取站点信息、文章列表、评论实时更新等能力。

### 4.5 备份与运维能力已进入主链路

备份系统不再只是接口占位，而是已经实现：

- SQLite 一致性快照导出
- ZIP 打包
- 下载、删除、恢复、合并恢复
- 调度策略与运行记录

问题主要集中在路径与存储坐标统一性，而不是“能力不存在”。

### 4.6 可观测性已有起点

后端已经具备 `tracing_subscriber`、`TraceLayer`、`/api/v1/health`、`/api/v1/version`，前端也已发送 `X-Client-Request-Id`。这意味着可观测性不是从零开始，只是**还没有真正闭合到请求级追踪**。

---

## 五、重点问题与审计结论

### 5.1 数据库与迁移治理：真实入口已收敛，但旧入口残留

#### 现象
- 真实运行链路中的迁移入口已经收敛到 `src/main.rs`。
- `src/db.rs` 与 `src/infra/db/pool.rs` 仍保留早期迁移逻辑，只覆盖 `001~003`。
- 新旧入口并存，但只有其中一套代表真实运行事实。

#### 风险
- 后续维护者可能误判“迁移入口有两到三套都在用”。
- 旧入口只覆盖早期迁移，若误用会与真实 `001~013` 集合严重脱节。
- 架构理解成本被无谓放大。

#### 建议
- 将旧迁移入口显式标记为历史残留，或直接删除。
- 在文档中固定“唯一迁移入口 = `src/main.rs`”。
- 后续所有迁移相关说明都只围绕当前主入口展开。

---

### 5.2 API 契约与兼容层治理：正式层已立，但 legacy 仍承载真实流量

#### 现象
- 后台管理端已主要切换到 `/api/v1/...`。
- 默认主题前台仍真实依赖 legacy `/api/*`，包括搜索、评论、个人资料等路径。
- legacy 非 auth 路由已挂 `Deprecation / Sunset` 头，但 legacy auth 路由未统一挂载相同弃用头策略。

#### 风险
- 若把 `/api/*` 误当成“空壳兼容层”，会直接破坏默认主题主链路。
- 文档若只写“正式接口已迁移到 `/api/v1`”，会掩盖兼容层仍在承载业务这一事实。
- 弃用策略不一致，会让前台迁移计划缺少可靠退出条件。

#### 建议
- 明确写出“`/api/v1` 是正式契约，legacy `/api` 仍在过渡期真实服务默认主题”。
- 补齐兼容层退出计划：按页面、主题与接口分批迁移，而不是一次性删除。
- 统一 legacy 弃用头策略，避免部分接口看起来像正式接口、部分接口又像临时兼容。

---

### 5.3 setup / auth 边界仍未闭合

#### 现象
- `login()` 已显式阻断 setup 未完成状态。
- `register()` 当前仍主要依赖 `allow_register`，没有复用同样的 setup 完成前置判断。
- 当库中尚无用户时，首个公开注册用户仍可能被赋予 `admin` 角色。

#### 风险
这是当前最接近 **P0 / P1** 的结构风险：安装向导本应是唯一管理员初始化入口，但公开注册链路仍可能成为旁路。

#### 建议
- 将 `ensure_setup_completed()` 收口为 auth 入口统一前置条件。
- 明确“公开注册”只在 setup 完成后才允许生效。
- 首个管理员创建只允许由 `setup initialize` 完成。

---

### 5.4 管理后台一致性：路由前缀、设置写链路与用户资料 PATCH 语义仍待收口

#### 现象
- 多个后台页面仍使用根路径导航，未完全锁定在 `/admin/*`。
- `Settings.tsx` 可编辑的字段与后端允许写入的字段不完全一致，形成“能改但不生效”的断链。
- `me/profile` 当前更接近“全量覆盖”而不是增量 PATCH，未传字段可能被默认值回写。

#### 风险
- 后台导航会跳出管理域，影响深链、刷新与未来桌面壳嵌入。
- 设置页会制造伪能力，用户看到配置项却无法真正保存。
- PATCH 语义错误会引发无意覆盖，放大用户资料更新风险。

#### 建议
- 为后台路由封装统一导航 helper 或统一改为 `/admin/...` 绝对路径。
- 先固定“设置契约清单”，再让前后端基于同一份清单维护可读 / 可写字段。
- `me/profile` 的 PATCH 应改为“先读原值，再 merge 显式传入字段”。

---

### 5.5 内容渲染与安全边界：Markdown sanitize 已落地，真正风险在高信任 HTML

#### 现象
- Markdown 渲染链路已经通过 `pulldown-cmark + ammonia::clean()` 做服务端 sanitize。
- 页面仍支持 `custom_html` 模式，上传后的 `index.html` 会以同源方式提供。
- 默认主题模板对 `post.content_html` 使用 `safe` 输出。
- Web 主链路未见通用 CSP。

#### 风险
- 旧文档若继续把“Markdown sanitize 未落地”当成核心风险，会误导排期。
- 当前真正的内容安全边界集中在“**谁有权限提交 HTML、HTML 在什么域下执行、模板如何信任已清洗内容**”。
- 缺失 CSP 会放大未来主题、插件与自定义 HTML 的同源执行风险。

#### 建议
- 把安全重点从“补 Markdown sanitize”切换为“收口自定义 HTML / 模板输出 / CSP 边界”。
- 明确 `custom_html` 的信任模型：仅管理员可用、是否隔离目录、是否需要独立源或更严格头策略。
- 为主题渲染链路引入更明确的 CSP / 安全头策略，并区分“已清洗 HTML”和“原始自定义 HTML”。

---

### 5.6 搜索架构与检索正确性：接口看似完整，但契约存在失真

#### 现象
- 当前搜索依赖 SQLite FTS5，方向本身合理。
- `SearchQuery.tag_id` 已暴露到接口层，但当前实现没有真正参与过滤。
- `pagination.total` 当前直接等于 `items.len()`，不代表真实总量。

#### 风险
- 前端或未来主题如果相信 `tag_id` 已生效，会出现筛选结果与预期不一致。
- 分页组件若依赖 `total`，在多页结果下会得出错误分页信息。
- 这是典型的“契约看起来完整、实际语义不完整”的问题。

#### 建议
- 修复 `tag_id` 过滤链路，保证 DTO 暴露的字段一定真实生效。
- 将 `total` 改为独立计数查询，明确其语义是“命中总数”而不是“当前页项目数”。
- 为搜索契约增加最少量的回归验证，尤其是标签过滤与分页统计。

---

### 5.7 评论、通知与 WebSocket：前台链路成立，后台消费尚未完全闭合

#### 现象
- 评论审核成功后，会通过 `tokio::sync::broadcast` 广播实时事件。
- 默认主题前台已真实消费 `/ws/public`，评论区可接收更新。
- 后台存在 `/ws/admin` 与 `useWebSocket.ts` 自动重连 hook，但仓库内暂未见明确消费页面。
- `comment_require_login` 的设置语义与实际 handler 行为仍需继续对齐验证。

#### 风险
- 后台实时通知如果没有消费方，会形成“服务端与 hook 都存在，但用户无感知”的伪闭环。
- 设置项若与 handler 实际行为不一致，会导致产品语义与实现脱节。

#### 建议
- 决定后台是否真正启用实时通知；若启用，就为其补齐明确消费页面。
- 核对评论登录要求的设置语义与 handler 行为，避免配置名义与运行时事实冲突。

---

### 5.8 可观测性与诊断能力：基础已在，但 request-id 还没打通

#### 现象
- 后端已有 `TraceLayer`、健康检查、版本接口与日志基础设施。
- 前端管理台和前台脚本都会发送 `X-Client-Request-Id`。
- 响应结构中的 `request_id` 却仍由服务端另行生成 UUID，与客户端请求头没有统一关系。

#### 风险
- 用户把前端错误截图或 request-id 提给开发者时，日志侧未必能直接关联到同一请求。
- 可观测性看似“都有一点”，但真正排障时仍会断在前后端边界上。

#### 建议
- 统一 request-id 来源或建立稳定映射关系。
- 让 `ApiResponse.request_id` 与 tracing 上下文、客户端请求头进入同一关联链路。
- 把 request-id 打通视为 Phase 3A 的验收能力，而不是可有可无的附加项。

---

### 5.9 备份、恢复、部署与运行路径坐标仍不统一

#### 现象
- 备份创建与本地后端多使用 `current_dir()/backups`。
- 备份下载使用 `db_path.parent()/backups`。
- Docker、Litestream 与 SQLite URL 解析逻辑使用的坐标系不完全一致。
- `parse_sqlite_url()` 中对路径的 `trim_start_matches('/')` 可能破坏绝对路径语义。
- 备份模块中的 S3 后端仍是占位，真实逻辑仍保留本地归档兼容路径。

#### 风险
- 本地开发、容器部署、恢复、下载与未来对象存储扩展之间会出现“写一处、读另一处”的问题。
- SQLite 绝对路径在不同运行环境下可能被错误归一化。
- 文档如果继续只写单一路径事实，会进一步掩盖当前坐标漂移。

#### 建议
- 用统一的 `AppConfig.paths` 或显式 `backup_dir` 派生数据库、备份、上传和静态目录。
- 修正 SQLite URL 解析，避免私自剥离绝对路径前导 `/`。
- 明确区分“应用内备份系统”与“Litestream 复制链路”的职责，避免两者被混写成同一能力。

---

### 5.10 Tauri：实验壳已成形，但尚未达到可验收状态

#### 现象
- `src-tauri/` 已引入 workspace、sidecar 生命周期代码、窗口管理与 setup → admin 跳转尝试。
- `window.rs` 已固定使用 `2000` 作为 Web 入口。
- sidecar 当前读取 `data.setup_stage`，而后端 `SetupStatusResponse` 返回的是 `data.stage`。
- 桌面构建、资源、打包与 dev / prod 一致性尚未闭环。

#### 风险
- 字段契约错位会直接阻断桌面安装态判断。
- 若继续把 Tauri 记为“已完成阶段”，会误导后续路线图和优先级排序。

#### 建议
- 先修复 `stage` 字段契约，再恢复 `tauri dev` 与 workspace 构建。
- 在单窗口、多窗口、sidecar 策略之间先固定一种验收模型，不要并行试探。
- 在 Web 主链路验收稳定之前，不把桌面壳当成主交付物对外承诺。

---

### 5.11 自动化测试、验收与 CI：当前是系统性短板

#### 现象
- 后端仅见基础 `src/tests.rs`。
- 未见前端 Vitest / Jest / Playwright / Cypress 体系。
- `.github/workflows/` 目录为空，未形成基础 CI。

#### 风险
- 每次改动都更依赖人工记忆和手工回归。
- 文档虽然在收敛，但没有自动化兜底时，漂移会再次发生。
- 当前阶段的很多争议其实都不是“实现不了”，而是“没有稳定回归机制证明它真的没坏”。

#### 建议
- 先建立最小 CI：`cargo check --workspace` + 管理台构建。
- 为 setup、认证、搜索、设置保存、备份恢复补最小主链路回归。
- 把 `INTEGRATION_TEST_CHECKLIST.md` 从纯清单逐步变成真实验收入口，而不是只做记录。

---

### 5.12 文档治理：入口已收敛，但必须继续守住职责边界

#### 现象
- `memories/README.md` 已被收敛为纯导航。
- `PROJECT_STATUS.md` 已作为唯一真相源。
- 但此前文档中仍残留“Markdown sanitize 未落地”“安装向导未完成”“默认端口 3000”“迁移仅到 010”等过时表述。

#### 风险
- 一旦根 README、状态文档、阶段清单和审计报告再次分别用不同口径表达同一事实，后续开发会重新回到“先猜哪个文档更可信”。

#### 建议
- `README.md` 只描述对外事实与使用方式，不承担阶段判断。
- `PROJECT_STATUS.md` 只承载当前状态结论。
- 审计报告只负责阶段性结构判断，不与索引页混写。
- 每次较大补证后，同步 `PROJECT_STATUS.md`、`phase-task-checklist.md`、`INTEGRATION_TEST_CHECKLIST.md` 与根 `README.md`。

---

## 六、风险分级

| 级别 | 问题 | 影响 |
|---|---|---|
| P0 / P1 | setup / register 边界未闭合 | 可能绕过安装流程创建首个管理员 |
| P1 | 管理后台路由、设置、PATCH 语义未收口 | 后台导航不稳定、设置伪生效、用户资料可能被误覆盖 |
| P1 | `custom_html` / 模板 `safe` / CSP 内容安全边界未收口 | 高信任 HTML 与同源执行风险持续存在 |
| P1 | 搜索 `tag_id` 与 `pagination.total` 契约失真 | 直接影响检索正确性与分页行为 |
| P1 | 备份 / 下载 / Docker / Litestream / SQLite URL 坐标不一致 | 放大恢复、部署与运维成本 |
| P1 | Tauri `stage` 字段契约错位 | 阻断桌面态 setup 判断与验收 |
| P2 | legacy `/api` 仍在真实承载流量，但退出计划未固化 | 前台主题迁移路径不清晰 |
| P2 | request-id 未贯通前后端 | 排障链路中断，可观测性收益受限 |
| P2 | 后台 WebSocket 消费闭环不完整 | 实时能力存在感不稳定 |
| P2 | 自动化测试与 CI 基本缺位 | 任何边界修复都难以稳定验收 |
| P2 | 文档容易因多入口更新不一致再次漂移 | 影响后续会话、排期与决策准确性 |

---

## 七、建议推进顺序

### 第一优先级：收口 Web 主链路边界
1. 修复 setup / register 边界
2. 修复后台路由前缀、设置写链路与 `me/profile` PATCH 语义
3. 修复搜索 `tag_id` 与 `pagination.total` 的契约正确性

### 第二优先级：收口内容安全与兼容层治理
4. 明确 `custom_html`、主题模板 `safe` 输出与 CSP 策略
5. 为 legacy `/api` 制定分阶段退出路径，并补齐弃用头策略
6. 打通 request-id 与日志链路

### 第三优先级：统一运行与部署坐标
7. 统一数据库、备份、上传、Docker、Litestream 与下载路径来源
8. 修正 SQLite URL 绝对路径解析
9. 统一后台静态入口文件与部署语义

### 第四优先级：恢复 Tauri 验收
10. 修复 sidecar 对 setup 状态字段的读取
11. 恢复 workspace 构建与 `tauri dev`
12. 在固定窗口模型后再做桌面态回归

### 第五优先级：建立最小自动化验收
13. 建立最小 CI
14. 把集成测试清单逐步转成可重复执行的真实回归入口

---

## 八、最终结论

InkForge 当前**不是一个方向错误的系统**。相反，它已经拥有一个相当清晰的 Web 优先单体 CMS 骨架，且许多核心能力都已真实落地。当前最需要的不是继续快速扩张模块面，而是先把 **setup / auth、后台契约、搜索正确性、内容安全边界、部署坐标、Tauri 契约与验收机制** 这几类主问题收口。

只要按本报告建议顺序推进，InkForge 会很快从“功能很多但边界容易漂移”进入“可以稳定承载后续复杂度”的状态。那时再进入插件系统、主题构建链和桌面能力，成本会更低，也更可控。
