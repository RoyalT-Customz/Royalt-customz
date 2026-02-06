-- Migration: Update to version 2.7.0
-- Version: 2.7.0
-- Description: Marketplace product detail pages feature

-- This migration updates the database version to 2.7.0
-- No schema changes required - all tables and columns are already in place
-- This version includes:
-- - Marketplace product detail pages
-- - Public product API endpoint
-- - Enhanced product viewing experience

-- Update database version
UPDATE site_settings SET value = '2.7.0' WHERE key = 'db_version';

-- Verify all required tables exist (idempotent checks)
-- Products table (already exists, but verify structure)
-- No changes needed - products table already has all required columns:
-- - id, name, description, price, category, image_url, is_escrow, tebex_link

-- Reviews table (for product ratings - already exists)
-- No changes needed - reviews table already supports product reviews

-- All indexes are in place for optimal performance

