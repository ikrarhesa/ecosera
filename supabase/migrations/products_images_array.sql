-- ============================================================
-- Ecosera: Add images array column to products
-- Run this in the Supabase SQL Editor
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];

-- ============================================================
-- This stores an array of image URLs for multi-photo products.
-- The image_url column remains for backwards compatibility
-- (stores the primary/first image).
-- ============================================================
