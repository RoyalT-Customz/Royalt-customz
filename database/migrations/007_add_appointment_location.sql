-- Migration 007: Add location field to appointments table
-- Version: 2.4.0
-- Description: Add location field for appointment location tracking

-- Add location column to appointments table
ALTER TABLE appointments ADD COLUMN location TEXT;

-- Update database version
UPDATE site_settings SET value = '2.4.0' WHERE key = 'db_version';



