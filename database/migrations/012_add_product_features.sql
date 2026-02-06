-- Migration: Add product features, framework support, and technical details
-- Version: 2.8.0
-- Description: Add key_features, framework_support, and technical_details columns to products table

-- Add key_features column (JSON string to store array of feature objects)
ALTER TABLE products ADD COLUMN key_features TEXT;

-- Add framework_support column (JSON string to store array of framework names)
ALTER TABLE products ADD COLUMN framework_support TEXT;

-- Add technical_details column (JSON string to store technical information - optional)
ALTER TABLE products ADD COLUMN technical_details TEXT;

-- Update database version
UPDATE site_settings SET value = '2.8.0' WHERE key = 'db_version';

