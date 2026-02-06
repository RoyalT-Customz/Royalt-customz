-- Migration: Add Discord integration, privacy settings, and password reset
-- Version: 2.2.0
-- Date: 2024

-- Add Discord fields to users table
ALTER TABLE users ADD COLUMN discord_user_id TEXT;
ALTER TABLE users ADD COLUMN discord_username TEXT;
ALTER TABLE users ADD COLUMN discord_display_name TEXT;
ALTER TABLE users ADD COLUMN discord_email TEXT;
ALTER TABLE users ADD COLUMN discord_server_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN discord_connected_at DATETIME;

-- Add privacy settings to users table
ALTER TABLE users ADD COLUMN hide_email INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN hide_phone INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN hide_full_name INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN privacy_level TEXT DEFAULT 'public';

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Create indexes for Discord fields
CREATE INDEX IF NOT EXISTS idx_users_discord_user_id ON users(discord_user_id);
CREATE INDEX IF NOT EXISTS idx_users_discord_server_verified ON users(discord_server_verified);

-- Update database version
UPDATE site_settings SET value = '2.2.0' WHERE key = 'db_version';


