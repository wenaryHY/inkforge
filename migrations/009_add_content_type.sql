-- Phase 1: Add content_type and custom_html_path to posts table
-- Supports post | page content types; pages can use custom HTML uploads

ALTER TABLE posts ADD COLUMN content_type TEXT NOT NULL DEFAULT 'post';
ALTER TABLE posts ADD COLUMN custom_html_path TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);
