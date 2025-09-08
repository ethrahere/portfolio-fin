/*
  # Fix category filtering and support multiple categories per project

  1. Changes
    - Create junction table for many-to-many relationship between projects and categories
    - Update existing data to use the new structure
    - Update RLS policies for the new table

  2. New Tables
    - `project_categories` (junction table)
      - `project_id` (uuid, foreign key to projects)
      - `category_id` (uuid, foreign key to categories)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on new junction table
    - Add policies for public read access and authenticated user management
*/

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, category_id)
);

-- Enable RLS
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Project categories are publicly readable"
  ON project_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project categories"
  ON project_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Migrate existing data from projects.category_id to junction table
INSERT INTO project_categories (project_id, category_id)
SELECT p.id, p.category_id
FROM projects p
WHERE p.category_id IS NOT NULL
ON CONFLICT (project_id, category_id) DO NOTHING;

-- Remove the old category_id column from projects (optional, keeping for backward compatibility)
-- ALTER TABLE projects DROP COLUMN IF EXISTS category_id;

-- Migration: Add project_audio table for associating audio files/URLs with projects
CREATE TABLE IF NOT EXISTS project_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  title text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project audio is publicly readable"
  ON project_audio
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project audio"
  ON project_audio
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);