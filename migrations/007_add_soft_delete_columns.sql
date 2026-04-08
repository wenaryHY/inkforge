-- categories: add updated_at + deleted_at
ALTER TABLE categories ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN deleted_at TEXT;
UPDATE categories SET updated_at = created_at WHERE updated_at = '';

-- tags: add updated_at + deleted_at
ALTER TABLE tags ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE tags ADD COLUMN deleted_at TEXT;
UPDATE tags SET updated_at = created_at WHERE updated_at = '';

-- media: add updated_at + deleted_at
ALTER TABLE media ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE media ADD COLUMN deleted_at TEXT;
UPDATE media SET updated_at = created_at WHERE updated_at = '';

-- users: add deleted_at (updated_at already exists)
ALTER TABLE users ADD COLUMN deleted_at TEXT;

-- posts: add deleted_at (updated_at already exists)
ALTER TABLE posts ADD COLUMN deleted_at TEXT;

-- media_categories: add updated_at + deleted_at
ALTER TABLE media_categories ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE media_categories ADD COLUMN deleted_at TEXT;
UPDATE media_categories SET updated_at = created_at WHERE updated_at = '';
