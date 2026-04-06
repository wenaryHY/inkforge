-- 主题配置表
CREATE TABLE IF NOT EXISTS theme_configs (
  id TEXT PRIMARY KEY,
  theme_slug TEXT NOT NULL UNIQUE,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 主题激活状态（如果 settings 表不存在则创建）
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 初始化活跃主题设置
INSERT OR IGNORE INTO settings (key, value, updated_at) 
VALUES ('active_theme', 'default', datetime('now'));

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_theme_configs_slug ON theme_configs(theme_slug);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
