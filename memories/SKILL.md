# InkForge 开发技能文档

## Rust 编程技能

### 异步编程
- **tokio**: 异步运行时，用于并发任务处理
- **async/await**: Rust 异步语法
- **Future trait**: 异步操作的基础抽象
- **Pin/Unpin**: 异步编程中的内存安全

### Web 框架
- **Axum**: 高性能异步 Web 框架
  - 路由定义与中间件
  - 提取器 (Extractors)
  - 响应处理
  - 错误处理
  - 状态管理

### 数据库
- **SQLx**: 编译时检查的 SQL 查询库
  - 异步数据库操作
  - 连接池管理
  - 事务处理
  - 迁移管理

### 序列化
- **serde**: 数据序列化/反序列化框架
  - JSON 处理
  - 自定义序列化逻辑
  - 属性宏 (derive macros)

### 错误处理
- **自定义错误类型**: AppError 枚举
- **Result 类型**: 错误传播
- **错误转换**: From/Into trait

### 模块化设计
- **模块系统**: pub mod 与 pub use
- **可见性控制**: pub/private
- **模块组织**: 分层架构

## 前端技能

### HTML/CSS
- 语义化 HTML
- CSS 布局 (Flexbox, Grid)
- 响应式设计
- 主题系统

### JavaScript/TypeScript
- DOM 操作
- 事件处理
- 异步编程 (Promise, async/await)
- API 调用

### 前端框架
- 组件化开发
- 状态管理
- 路由管理
- 表单处理

## 数据库设计

### SQLite
- 表设计与索引
- 数据类型选择
- 约束与关系
- 迁移管理

### 数据库迁移
- 版本控制
- 向后兼容性
- 数据一致性

## 系统设计

### 架构模式
- **分层架构**: Handler → Service → Repository
- **领域驱动设计**: Domain models
- **依赖注入**: 通过 AppState

### API 设计
- RESTful 原则
- 状态码使用
- 错误响应格式
- 分页与过滤

### 安全性
- 身份认证 (JWT)
- 授权控制 (AdminUser)
- 输入验证
- SQL 注入防护

## 开发工具

### 版本控制
- Git 基础命令
- 分支管理
- 提交规范

### 构建工具
- Cargo: Rust 包管理器
- 依赖管理
- 编译优化

### 测试
- 单元测试
- 集成测试
- 测试覆盖率

## 部署与运维

### Docker
- 容器化应用
- Dockerfile 编写
- 镜像构建与推送

### 配置管理
- 环境变量
- 配置文件
- 密钥管理

### 监控与日志
- 日志记录
- 性能监控
- 错误追踪

## 最佳实践

### 代码质量
- 代码审查
- 命名规范
- 注释与文档
- 代码重构

### 性能优化
- 数据库查询优化
- 缓存策略
- 异步处理
- 资源管理

### 可维护性
- 模块化设计
- 接口抽象
- 文档完整性
- 测试覆盖

## 学习资源

### Rust
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Tokio 教程](https://tokio.rs/)
- [Axum 文档](https://docs.rs/axum/)

### Web 开发
- [MDN Web Docs](https://developer.mozilla.org/)
- [RESTful API 设计](https://restfulapi.net/)

### 数据库
- [SQLite 官方文档](https://www.sqlite.org/docs.html)
- [SQL 最佳实践](https://use-the-index-luke.com/)

## 项目特定技能

### InkForge 架构
- 模块化 CMS 系统
- 多主题支持
- 媒体管理系统
- 备份与恢复
- WebSocket 实时通知
- **Headless Rust Core + Web-Based Theme Engine** (未来方向)

### Tauri 框架
- 桌面应用开发
- 自定义协议 (Custom Protocol)
- IPC 通信 (Rust ↔ JavaScript)
- 窗口管理
- 文件系统访问

### JavaScript SDK 开发
- 全局对象设计 (window.cms)
- 事件钩子系统
- CSS 变量系统
- 数据绑定

### 常见任务
- 添加新的 API 端点
- 创建数据库迁移
- 实现新的模块
- 优化查询性能
- 处理错误情况
- 创建主题
- 集成 Tauri
- 开发 SDK
