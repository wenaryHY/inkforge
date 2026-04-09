-- Phase 1 fix: Add page_render_mode to posts table
-- 'editor' = render via theme template (content_md → content_html)
-- 'custom_html' = serve custom HTML/ZIP directly

ALTER TABLE posts ADD COLUMN page_render_mode TEXT NOT NULL DEFAULT 'editor';

CREATE INDEX IF NOT EXISTS idx_posts_page_render_mode ON posts(page_render_mode);
