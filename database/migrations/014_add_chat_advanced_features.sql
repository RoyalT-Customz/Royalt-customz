-- Migration: Add Advanced Chat Features
-- Version: 2.10.0
-- Description: Adds reactions, threads, DMs, file uploads, mentions, and more

-- ============================================
-- MESSAGE REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_reactions (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

-- ============================================
-- MESSAGE THREADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_threads (
    id TEXT PRIMARY KEY,
    parent_message_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    title TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_message_threads_parent_message_id ON message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_room_id ON message_threads(room_id);

-- ============================================
-- DIRECT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS direct_messages (
    id TEXT PRIMARY KEY,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_user1_id ON direct_messages(user1_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_user2_id ON direct_messages(user2_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_last_message_at ON direct_messages(last_message_at);

-- ============================================
-- DIRECT MESSAGE MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS direct_message_messages (
    id TEXT PRIMARY KEY,
    dm_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    message TEXT NOT NULL,
    edited INTEGER DEFAULT 0,
    edited_at DATETIME,
    deleted INTEGER DEFAULT 0,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dm_id) REFERENCES direct_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_dm_id ON direct_message_messages(dm_id);
CREATE INDEX IF NOT EXISTS idx_dm_messages_sender_id ON direct_message_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_messages_created_at ON direct_message_messages(created_at);

-- ============================================
-- MESSAGE ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_attachments (
    id TEXT PRIMARY KEY,
    message_id TEXT,
    dm_message_id TEXT,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (dm_message_id) REFERENCES direct_message_messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_dm_message_id ON message_attachments(dm_message_id);

-- ============================================
-- MESSAGE MENTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_mentions (
    id TEXT PRIMARY KEY,
    message_id TEXT,
    dm_message_id TEXT,
    mentioned_user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (dm_message_id) REFERENCES direct_message_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_mentions_message_id ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_dm_message_id ON message_mentions(dm_message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_mentioned_user_id ON message_mentions(mentioned_user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'mention', 'dm', 'reply', 'reaction'
    message_id TEXT,
    dm_message_id TEXT,
    thread_id TEXT,
    from_user_id TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (dm_message_id) REFERENCES direct_message_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_read ON chat_notifications(read);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_created_at ON chat_notifications(created_at);

-- ============================================
-- PINNED MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pinned_messages (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    pinned_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (pinned_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pinned_messages_room_id ON pinned_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_pinned_messages_message_id ON pinned_messages(message_id);

-- ============================================
-- READ RECEIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id TEXT PRIMARY KEY,
    message_id TEXT,
    dm_message_id TEXT,
    user_id TEXT NOT NULL,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (dm_message_id) REFERENCES direct_message_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id),
    UNIQUE(dm_message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_dm_message_id ON message_read_receipts(dm_message_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user_id ON message_read_receipts(user_id);

-- ============================================
-- UPDATE CHAT_MESSAGES TABLE
-- ============================================
-- Add thread_id column if it doesn't exist
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS directly
-- We'll handle this in the migration script

-- ============================================
-- UPDATE CHAT_ROOMS TABLE
-- ============================================
-- Add additional fields for channel management
-- owner_id, is_public, member_count, etc.

-- ============================================
-- UPDATE DATABASE VERSION
-- ============================================
UPDATE site_settings SET value = '2.10.0' WHERE key = 'db_version';

