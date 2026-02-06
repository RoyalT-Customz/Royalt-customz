-- Migration: Add user profile fields and role
-- Run this if you have an existing database without these fields

-- Add first_name column (if it doesn't exist)
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- You may need to check manually or handle errors

-- Add first_name
ALTER TABLE users ADD COLUMN first_name TEXT;

-- Add last_name
ALTER TABLE users ADD COLUMN last_name TEXT;

-- Add avatar_url
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Add bio
ALTER TABLE users ADD COLUMN bio TEXT;

-- Add role (default 'user')
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Add is_active (default 1)
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;

-- Add is_verified (default 0)
ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;

-- Add last_login
ALTER TABLE users ADD COLUMN last_login DATETIME;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to set defaults
UPDATE users SET role = 'user' WHERE role IS NULL;
UPDATE users SET is_active = 1 WHERE is_active IS NULL;
UPDATE users SET is_verified = 0 WHERE is_verified IS NULL;


