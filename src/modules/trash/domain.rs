use serde::Serialize;

/// 回收站中的统一条目，跨表聚合
#[derive(Debug, Clone, Serialize)]
pub struct TrashItem {
    pub id: String,
    /// 条目类型：post / category / tag / media / media_category
    pub item_type: String,
    /// 显示名称（标题或名称）
    pub name: String,
    /// 附加描述（slug / 文件名等）
    pub subtitle: Option<String>,
    /// 删除时间
    pub deleted_at: String,
    /// 距离自动永久删除还剩几天（负数表示已过期）
    pub expires_in_days: i64,
}
