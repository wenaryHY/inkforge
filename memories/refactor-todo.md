# Refactor ToDo

## Completed
- [x] Replace app entry with new bootstrap/router/state structure
- [x] Introduce shared config, auth, error, response, pagination utilities
- [x] Add new auth, user, post, comment, media, setting, theme backend modules
- [x] Replace database schema with new v0.2-oriented initial migration
- [x] Rebuild default theme templates to match new payload structure
- [x] Verify backend compiles against fresh schema and initializes `inkforge.db`
- [x] Add admin-side APIs for categories and tags management
- [x] Implement theme zip upload
- [x] Adapt admin frontend to the new API contract
- [x] Add admin-side category/tag update UI bindings in the frontend
- [x] Verify admin frontend builds against the new backend payloads

## Next (v0.3 Optimization - Started 2026/04/06)

### 阶段 1: 架构重构
- [ ] 创建 infra 目录结构（db, jwt, storage, hash, plugin）
- [ ] 迁移 src/db.rs 到 src/infra/db/
- [ ] 迁移 JWT 逻辑到 src/infra/jwt/
- [ ] 迁移密码哈希到 src/infra/hash/
- [ ] 独立 category 模块（从 post 模块拆分）
- [ ] 独立 tag 模块（从 post 模块拆分）
- [ ] 添加 tag 更新接口 PATCH /api/admin/tags/:id
- [ ] 为 setting 模块添加 service.rs 层

### 阶段 2: 安全和部署修复
- [ ] 修复 Dockerfile（二进制名称 halo-rs → inkforge）
- [ ] 修复 Dockerfile（环境变量前缀 HALO__ → INKFORGE__）
- [ ] 添加启动时配置验证（JWT secret 检查）
- [ ] 添加健康检查端点 GET /api/health
- [ ] 添加版本信息端点 GET /api/version
- [ ] 实现 Media 上传 MIME 类型白名单验证

### 阶段 3: SEO 模块完善（高优先级）
- [ ] 实现 Robots.txt 生成 GET /robots.txt
- [ ] 实现 Meta 标签管理（title, description, keywords, og:image）
- [ ] 实现结构化数据（JSON-LD）
- [ ] 实现自动文章摘要生成

### 阶段 4: Backup 模块实现（高优先级）
- [ ] 实现手动备份 API POST /api/admin/backup
- [ ] 实现备份恢复 API POST /api/admin/backup/restore
- [ ] 实现自动备份定时任务
- [ ] 实现备份计划配置 API
- [ ] 在设置页面集成备份功能

### 阶段 5: Media 分类增强
- [ ] 设计默认分类配置结构
- [ ] 实现自定义分类管理 API
- [ ] 实现文件后缀关联逻辑
- [ ] 在管理后台添加分类配置 UI

### 阶段 6: 主题配置系统
- [ ] 扩展 theme.toml 支持 config_schema
- [ ] 实现主题配置存储（settings 表）
- [ ] 实现主题切换时的配置迁移逻辑
- [ ] 实现主题缓存自动更新
- [ ] 支持主题自定义配置页面

### 阶段 7: 首次安装向导
- [ ] 实现安装检测逻辑（.installed 文件）
- [ ] 创建 /install 路由和 UI
- [ ] 实现安装向导流程（管理员、站点、主题）
- [ ] 实现未安装时的请求重定向

### 阶段 8: 插件系统接口（预留）
- [ ] 定义 Plugin trait（路由、数据库、钩子、事件）
- [ ] 实现 PluginContext
- [ ] 预留管理后台菜单扩展点
- [ ] 编写插件开发文档

### 阶段 9: 测试和文档
- [ ] 添加单元测试（service 层）
- [ ] 添加集成测试（API 端点）
- [ ] 创建 docker-compose.yml
- [ ] 编写 Windows 部署脚本
- [ ] 编写 Linux systemd 服务文件
- [ ] 更新 README 部署说明

### v0.2 遗留任务
- [ ] Tighten theme service fallback behavior and add more manifest validation
- [ ] Add tests for auth, comments, media, post, and theme upload flows
