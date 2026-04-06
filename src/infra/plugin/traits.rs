use sqlx::SqlitePool;

// 插件系统接口预留
// 当前版本暂不实现完整的插件系统，仅定义基本结构供未来扩展

/// 插件元数据
#[derive(Debug, Clone)]
pub struct PluginMetadata {
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
}

/// 插件上下文，提供给插件访问系统资源
#[derive(Clone)]
pub struct PluginContext {
    pub db: SqlitePool,
    // 未来可以添加更多上下文
}

/// 插件事件类型
#[derive(Debug, Clone)]
pub enum PluginEvent {
    PostPublished { post_id: String },
    PostUpdated { post_id: String },
    PostDeleted { post_id: String },
    CommentCreated { comment_id: String },
    UserRegistered { user_id: String },
    ThemeActivated { theme_slug: String },
}

/// 插件钩子点（预留）
/// 
/// 未来插件可以通过以下方式扩展系统：
/// - 自定义路由（添加新的 API 端点）
/// - 数据库表扩展（插件可创建自己的表）
/// - 主题钩子（在模板中插入内容）
/// - 事件监听（如文章发布时触发）
/// - 管理后台菜单扩展
/// 
/// 示例实现将在后续版本中提供
#[allow(dead_code)]
pub struct PluginHooks {
    // 预留字段
}
