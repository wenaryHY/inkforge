-- 001: 初始建表
CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY NOT NULL,
    username     TEXT NOT NULL UNIQUE,
    email        TEXT NOT NULL UNIQUE,
    password     TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar       TEXT,
    bio          TEXT,
    role         TEXT NOT NULL DEFAULT 'editor',
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
    id         TEXT PRIMARY KEY NOT NULL,
    name       TEXT NOT NULL UNIQUE,
    slug       TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
    id           TEXT PRIMARY KEY NOT NULL,
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    excerpt      TEXT,
    content      TEXT NOT NULL DEFAULT '',
    content_html TEXT NOT NULL DEFAULT '',
    cover        TEXT,
    status       TEXT NOT NULL DEFAULT 'draft',
    post_type    TEXT NOT NULL DEFAULT 'post',
    author_id    TEXT NOT NULL,
    category_id  TEXT,
    allow_comment INTEGER NOT NULL DEFAULT 1,
    pinned       INTEGER NOT NULL DEFAULT 0,
    views        INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (author_id)   REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id  TEXT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id           TEXT PRIMARY KEY NOT NULL,
    post_id      TEXT NOT NULL,
    author_name  TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_url   TEXT,
    content      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    parent_id    TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY NOT NULL,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES
    ('site_title',       'My Blog'),
    ('site_description', 'A blog powered by InkForge 🦀'),
    ('site_url',         'http://localhost:3000'),
    ('posts_per_page',   '10'),
    ('allow_register',   'false'),
    ('allow_comment',    'true');

CREATE INDEX IF NOT EXISTS idx_posts_status   ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug     ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author   ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_comments_post  ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
