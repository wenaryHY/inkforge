-- categories: add updated_at + deleted_at
ALTER TABLE categories ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE categories ADD COLUMN deleted_at TEXT;

-- tags: add updated_at + deleted_at
ALTER TABLE tags ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tags ADD COLUMN deleted_at TEXT;

-- media: add updated_at + deleted_at
ALTER TABLE media ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE media ADD COLUMN deleted_at TEXT;

-- users: add deleted_at (updated_at already exists)
ALTER TABLE users ADD COLUMN deleted_at TEXT;

-- posts: add deleted_at (updated_at already exists)
ALTER TABLE posts ADD COLUMN deleted_at TEXT;

-- media_categories: add updated_at + deleted_at
ALTER TABLE media_categories ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE media_categories ADD COLUMN deleted_at TEXT;
