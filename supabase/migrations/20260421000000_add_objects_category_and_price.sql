-- Migration: Add objects category and price field
-- Created: 2026-04-21

-- Step 1: Add price column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS price TEXT;

COMMENT ON COLUMN projects.price IS 'Price for sale (for objects category - jewellery, decor, etc.)';

-- Step 2: Add objects category
INSERT INTO categories (name, slug, display_order)
VALUES ('OBJECTS', 'objects', 15)
ON CONFLICT (slug) DO NOTHING;
