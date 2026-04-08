-- 添加用户语言偏好字段
ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'zh';

-- 更新现有用户为默认中文
UPDATE users SET language = 'zh' WHERE language = '' OR language IS NULL;
