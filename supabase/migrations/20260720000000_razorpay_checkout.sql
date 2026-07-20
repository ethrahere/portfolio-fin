-- Migration: Replace Shopify checkout with Razorpay
-- Created: 2026-07-20

ALTER TABLE project_images
ADD COLUMN IF NOT EXISTS razorpay_amount NUMERIC;

ALTER TABLE project_images
DROP COLUMN IF EXISTS shopify_variant_id;

COMMENT ON COLUMN project_images.razorpay_amount IS 'Checkout price in rupees (e.g. 4500.00) used to create a Razorpay order for this item. Null/0 means not purchasable.';
