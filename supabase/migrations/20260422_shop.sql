-- Migration: Add shop fields
-- Created: 2026-04-22

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS show_in_shop BOOLEAN DEFAULT false;

ALTER TABLE project_images
ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT;

COMMENT ON COLUMN projects.show_in_shop IS 'Whether this project appears in the shop';
COMMENT ON COLUMN project_images.shopify_variant_id IS 'Shopify product variant GID for purchase (gid://shopify/ProductVariant/...)';
