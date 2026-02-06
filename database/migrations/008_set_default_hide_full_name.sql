-- Migration 008: Set default hide_full_name for all existing users
-- Version: 2.5.0
-- Description: Update all existing users to have hide_full_name = 1 by default (only show username)

-- Update all existing users to hide full name by default
UPDATE users SET hide_full_name = 1 WHERE hide_full_name IS NULL OR hide_full_name = 0;

-- Update database version
UPDATE site_settings SET value = '2.5.0' WHERE key = 'db_version';



