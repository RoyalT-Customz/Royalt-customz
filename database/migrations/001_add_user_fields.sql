-- Migration: Add first_name, last_name, and additional user fields
-- Run this if you have an existing database

-- Add new columns to users table (if they don't exist)
-- Note: SQLite/Turso doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- You may need to check if columns exist before adding them

-- Add first_name column
-- ALTER TABLE users ADD COLUMN first_name TEXT;

-- Add last_name column
-- ALTER TABLE users ADD COLUMN last_name TEXT;

-- Add avatar_url column
-- ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Add bio column
-- ALTER TABLE users ADD COLUMN bio TEXT;

-- Add is_active column
-- ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;

-- Add is_verified column
-- ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;

-- Add last_login column
-- ALTER TABLE users ADD COLUMN last_login DATETIME;

-- Create indexes for new columns
-- CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
-- CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Update existing users to set is_active = 1 if NULL
-- UPDATE users SET is_active = 1 WHERE is_active IS NULL;

-- Update existing users to set is_verified = 0 if NULL
-- UPDATE users SET is_verified = 0 WHERE is_verified IS NULL;


