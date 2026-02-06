-- Migration: Add Chat Tables
-- Version: 2.9.0
-- Description: Adds real-time chat functionality with rooms and messages

-- ============================================
-- CHAT ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_private INTEGER DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_at ON chat_rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_private ON chat_rooms(is_private);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    edited INTEGER DEFAULT 0,
    edited_at DATETIME,
    deleted INTEGER DEFAULT 0,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted ON chat_messages(deleted);

-- ============================================
-- CHAT ROOM MEMBERS TABLE (for private rooms)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_room_members (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON chat_room_members(user_id);

-- ============================================
-- INSERT DEFAULT GENERAL CHAT ROOM
-- ============================================
INSERT OR IGNORE INTO chat_rooms (id, name, description, is_private, created_by) VALUES
    ('general', 'General', 'Main chat room for all members', 0, NULL);

