-- Migration: Add name and price fields to project_images
-- Created: 2026-04-21

ALTER TABLE project_images
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS price TEXT;

COMMENT ON COLUMN project_images.name IS 'Individual item name (for objects category)';
COMMENT ON COLUMN project_images.price IS 'Individual item price (for objects category)';
