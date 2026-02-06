-- Migration 010: Ensure password reset tokens table is properly set up
-- Version: 2.6.0
-- Description: Ensures password_reset_tokens table exists with all required indexes
-- This migration is idempotent and safe to run multiple times

-- Create password reset tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used ON password_reset_tokens(used);

-- Ensure users table has discord_user_id column (for password reset via Discord)
-- Note: These ALTER TABLE statements will fail if columns already exist, which is fine
-- The migration script should handle this gracefully

-- Update database version
UPDATE site_settings SET value = '2.6.0' WHERE key = 'db_version';



