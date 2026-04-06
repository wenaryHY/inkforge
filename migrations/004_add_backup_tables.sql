CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    size INTEGER NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    manifest_hash TEXT NOT NULL,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS backup_schedules (
    id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    frequency TEXT NOT NULL DEFAULT 'daily',
    hour INTEGER NOT NULL DEFAULT 2,
    minute INTEGER NOT NULL DEFAULT 0,
    provider TEXT NOT NULL DEFAULT 'local',
    last_run_at TEXT,
    next_run_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
