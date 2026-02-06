-- Migration 009: Add hide_full_name column if it doesn't exist
-- Version: 2.5.1
-- Description: Safely add hide_full_name column to users table for existing databases

-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- This migration should be run via the TypeScript script which checks for column existence

-- Add hide_full_name column with default value of 1
ALTER TABLE users ADD COLUMN hide_full_name INTEGER DEFAULT 1;

-- Update all existing users to have hide_full_name = 1
UPDATE users SET hide_full_name = 1 WHERE hide_full_name IS NULL;

-- Update database version
UPDATE site_settings SET value = '2.5.1' WHERE key = 'db_version';



