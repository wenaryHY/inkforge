-- FTS5 full-text search for posts
-- 创建 FTS5 虚拟表（title + excerpt + content_md）
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
    title,
    excerpt,
    content_md,
    content='posts',
    content_rowid='rowid'
);

-- 触发器：插入时同步
CREATE TRIGGER IF NOT EXISTS posts_fts_insert AFTER INSERT ON posts BEGIN
    INSERT INTO posts_fts(rowid, title, excerpt, content_md)
    VALUES (NEW.rowid, NEW.title, NEW.excerpt, NEW.content_md);
END;

-- 触发器：更新时同步
CREATE TRIGGER IF NOT EXISTS posts_fts_update AFTER UPDATE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, content_md)
    VALUES ('delete', OLD.rowid, OLD.title, OLD.excerpt, OLD.content_md);
    INSERT INTO posts_fts(rowid, title, excerpt, content_md)
    VALUES (NEW.rowid, NEW.title, NEW.excerpt, NEW.content_md);
END;

-- 触发器：删除时同步
CREATE TRIGGER IF NOT EXISTS posts_fts_delete AFTER DELETE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, content_md)
    VALUES ('delete', OLD.rowid, OLD.title, OLD.excerpt, OLD.content_md);
END;

-- 用现有数据填充 FTS 表
INSERT INTO posts_fts(rowid, title, excerpt, content_md)
SELECT rowid, title, excerpt, content_md FROM posts;
