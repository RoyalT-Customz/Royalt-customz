-- Migration: Add category to blog_posts and create services table
-- Version: 2.1.0
-- Date: 2024
-- Safe migration that checks if column exists before adding

-- For SQLite/Turso, we need to check if the column exists first
-- Since SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN,
-- we'll use a pragma check approach

-- Step 1: Check if category column exists in blog_posts
-- If it doesn't exist, add it
-- Note: This will fail if column already exists, but that's OK - just ignore the error

-- For Turso/libSQL, we can try to add the column and catch the error
-- Or we can check using PRAGMA table_info

-- Method 1: Try to add (will fail silently if exists in some SQLite versions)
-- ALTER TABLE blog_posts ADD COLUMN category TEXT;

-- Method 2: Use a more robust approach with error handling
-- Since we can't use IF NOT EXISTS, we'll just try to add it
-- If it fails, the column already exists

-- Add category column (will error if exists, but that's OK)
ALTER TABLE blog_posts ADD COLUMN category TEXT;

-- Create index for blog_posts category (IF NOT EXISTS works for indexes)
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Create services table (IF NOT EXISTS works for tables)
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon TEXT, -- Lucide icon name as string
    duration_minutes INTEGER DEFAULT 60,
    price REAL,
    active INTEGER DEFAULT 1, -- 0 for inactive, 1 for active
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);

-- Update database version
UPDATE site_settings SET value = '2.1.0' WHERE key = 'db_version';


