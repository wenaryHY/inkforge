INSERT INTO settings (key, value, updated_at)
SELECT
    'setup_stage',
    CASE
        WHEN EXISTS (SELECT 1 FROM settings WHERE key = 'setup_completed' AND value = 'true') THEN 'completed'
        WHEN EXISTS (SELECT 1 FROM users LIMIT 1) THEN 'completed'
        ELSE 'not_started'
    END,
    datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'setup_stage');

INSERT OR IGNORE INTO settings (key, value, updated_at)
VALUES ('setup_completed', 'false', datetime('now'));

UPDATE settings
SET value = CASE
        WHEN EXISTS (SELECT 1 FROM settings AS s2 WHERE s2.key = 'setup_stage' AND s2.value = 'completed') THEN 'true'
        ELSE 'false'
    END,
    updated_at = datetime('now')
WHERE key = 'setup_completed';
