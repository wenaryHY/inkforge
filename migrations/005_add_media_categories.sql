-- 创建媒体分类表
CREATE TABLE IF NOT EXISTS media_categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 添加媒体分类索引
CREATE INDEX IF NOT EXISTS idx_media_categories_slug ON media_categories(slug);

-- 插入默认分类
INSERT OR IGNORE INTO media_categories (id, name, slug, description, icon, color, sort_order) VALUES
    ('cat_image', '图片', 'image', '图片文件', '🖼️', '#3B82F6', 0),
    ('cat_audio', '音频', 'audio', '音频文件', '🎵', '#8B5CF6', 1),
    ('cat_video', '视频', 'video', '视频文件', '🎬', '#EC4899', 2),
    ('cat_document', '文档', 'document', '文档文件', '📄', '#F59E0B', 3),
    ('cat_archive', '压缩包', 'archive', '压缩文件', '📦', '#6366F1', 4),
    ('cat_other', '其他', 'other', '其他文件', '📎', '#6B7280', 5);
