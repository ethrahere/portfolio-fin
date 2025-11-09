-- Migration: Convert design category to apps and add app_link field
-- Created: 2025-11-09

-- Step 1: Add app_link column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS app_link TEXT;

-- Step 2: Update design category to apps
UPDATE categories
SET
  name = 'APPS',
  slug = 'apps'
WHERE slug = 'design';

-- Step 3: Add comment to document the field
COMMENT ON COLUMN projects.app_link IS 'URL link to the app (for app projects in the apps category)';
