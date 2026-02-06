-- Migration: Add Moderation Tables
-- Version: 2.11.0
-- Description: Adds tables for user mutes and bans

-- ============================================
-- USER MUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_mutes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    muted_by TEXT NOT NULL,
    muted_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (muted_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_mutes_user_id ON user_mutes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_muted_until ON user_mutes(muted_until);

-- ============================================
-- USER BANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_bans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    banned_by TEXT NOT NULL,
    reason TEXT,
    banned_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_banned_until ON user_bans(banned_until);

-- Update database version
UPDATE site_settings SET value = '2.11.0' WHERE key = 'db_version';

