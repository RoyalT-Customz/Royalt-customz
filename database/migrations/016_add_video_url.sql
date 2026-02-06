-- Migration: Add video_url column to products table
-- Date: 2024
-- Description: Adds video_url field to support product videos (YouTube, Vimeo, or direct video links)

-- Add video_url column to products table
ALTER TABLE products ADD COLUMN video_url TEXT;

-- Note: This column is optional and can be NULL
-- It supports YouTube, Vimeo, or direct video URLs

