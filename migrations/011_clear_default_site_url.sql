-- Clear hardcoded site_url default; users should set it in Settings page.
-- This avoids port/domain mismatch on fresh installs.
UPDATE settings SET value = '' WHERE key = 'site_url' AND value = 'http://localhost:3000';
