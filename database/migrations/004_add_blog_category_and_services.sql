-- Migration: Add category to blog_posts and create services table
-- Version: 2.1.0
-- Date: 2024

-- Add category column to blog_posts if it doesn't exist
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- This will fail if column already exists, but that's OK - just ignore the error
-- For Drizzle Studio/SQL Console: Transaction keywords removed for compatibility

-- Attempt to add category column
-- If column already exists, this will fail but that's OK - just ignore the error
ALTER TABLE blog_posts ADD COLUMN category TEXT;

-- Create index for blog_posts category
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Create services table
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

