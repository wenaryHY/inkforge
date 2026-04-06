# InkForge 项目记忆库

本目录存储 InkForge 项目的规划、进度和技能文档。

## 文档导航

### 📋 项目进度
- **[v0.3-progress.md](./v0.3-progress.md)** - 当前版本完成情况
- **[v0.3-next-steps.md](./v0.3-next-steps.md)** - 后续优化计划
- **[v0.3-longterm-plan.md](./v0.3-longterm-plan.md)** - 长期规划
- **[v0.3-architecture-vision.md](./v0.3-architecture-vision.md)** - 长期架构愿景

### 📚 技能与参考
- **[SKILL.md](./SKILL.md)** - 开发技能文档
- **[skill-sources-plan.md](./skill-sources-plan.md)** - Skill 来源筛选与引入计划

### 🎯 阶段规划
- **[v0.3-stage6-ui-plan.md](./v0.3-stage6-ui-plan.md)** - 阶段6 前端 UI 集成方案
- **[v0.3-stage6-implementation.md](./v0.3-stage6-implementation.md)** - 阶段6 实施方案
- **[v0.3-stage7-theme-system-plan.md](./v0.3-stage7-theme-system-plan.md)** - 阶段7 主题系统规划

### 🔧 开发记录
- **[refactor-todo.md](./refactor-todo.md)** - 重构待办事项（已部分完成）

## 快速开始

### 了解项目状态
1. 查看 [v0.3-progress.md](./v0.3-progress.md) 了解已完成的工作
2. 查看 [v0.3-next-steps.md](./v0.3-next-steps.md) 了解下一步计划

### 学习开发技能
- 查看 [SKILL.md](./SKILL.md) 了解项目使用的技术栈和最佳实践

### 开始新任务
1. 确认任务在 [v0.3-next-steps.md](./v0.3-next-steps.md) 中的优先级
2. 查看相关的技能文档
3. 参考已完成的类似功能实现

## 项目结构

```
inkforge/
├── src/                    # 源代码
│   ├── modules/           # 功能模块
│   ├── bootstrap/         # 启动配置
│   ├── infra/            # 基础设施
│   ├── shared/           # 共享代码
│   └── routes/           # 路由定义
├── migrations/            # 数据库迁移
├── themes/               # 主题文件
├── uploads/              # 上传文件
├── memories/             # 项目文档 (本目录)
└── Cargo.toml           # 项目配置
```

## 当前版本信息

- **版本**: v0.3
- **状态**: 开发中
- **最后更新**: 2026-04-06

## 核心功能

### 已实现
- ✅ 用户认证与授权
- ✅ 文章管理 (CRUD)
- ✅ 评论系统
- ✅ 分类与标签
- ✅ 媒体管理
- ✅ 媒体分类
- ✅ 主题系统
- ✅ 备份与恢复
- ✅ SEO 优化
- ✅ WebSocket 实时通知

### 计划中
- 🔄 阶段6：前端 UI 集成（Media 分类增强前端落地）
- 🔄 Skill 体系建设与来源引入
- 🔄 性能优化
- 🔄 安全加固
- 🔄 功能扩展

## 技术栈

### 后端
- **语言**: Rust
- **框架**: Axum
- **数据库**: SQLite
- **异步运行时**: Tokio

### 前端
- **HTML/CSS/JavaScript**
- **响应式设计**
- **主题系统**

### 工具
- **版本控制**: Git
- **容器化**: Docker
- **包管理**: Cargo

## 开发指南

### 添加新功能
1. 在 `src/modules/` 中创建新模块
2. 定义 domain 模型
3. 实现 repository 层
4. 实现 service 层
5. 创建 handler 和 DTO
6. 在 router 中注册路由
7. 创建数据库迁移 (如需要)

### 代码规范
- 使用 Rust 命名规范
- 添加必要的文档注释
- 处理所有错误情况
- 编写单元测试

### 提交代码
1. 运行 `cargo check` 确保编译通过
2. 运行 `cargo test` 确保测试通过
3. 提交前更新相关文档

## 常见问题

### 如何运行项目?
```bash
cargo run
```

### 如何运行测试?
```bash
cargo test
```

### 如何检查代码?
```bash
cargo check
```

### 如何构建 Docker 镜像?
```bash
docker build -t inkforge:latest .
```

## 联系与支持

- 项目主页: [GitHub](https://github.com/wenaryHY/inkforge)
- 问题报告: 使用 GitHub Issues
- 功能建议: 使用 GitHub Discussions

## 许可证

MIT License

---

**最后更新**: 2026-04-06
**维护者**: InkForge Team
