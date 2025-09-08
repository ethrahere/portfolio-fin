/*
  # Portfolio Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - category name like "3D", "Design", etc.
      - `slug` (text, unique) - URL-friendly version
      - `display_order` (integer) - for ordering on homepage
      - `created_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text) - URL-friendly version
      - `description` (text)
      - `year` (integer)
      - `medium` (text)
      - `dimensions` (text)
      - `category_id` (uuid, foreign key)
      - `display_order` (integer) - for ordering within category
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `project_images`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `image_url` (text)
      - `alt_text` (text)
      - `display_order` (integer) - for image gallery ordering
      - `is_thumbnail` (boolean) - main thumbnail for project grid
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (portfolio is public)
    - Add policies for authenticated admin access for CRUD operations
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT '',
  year integer DEFAULT EXTRACT(YEAR FROM now()),
  medium text DEFAULT 'Digital',
  dimensions text DEFAULT 'Variable',
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Project images table
CREATE TABLE IF NOT EXISTS project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text DEFAULT '',
  display_order integer DEFAULT 0,
  is_thumbnail boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Create unique constraint for project slugs within categories
CREATE UNIQUE INDEX IF NOT EXISTS projects_category_slug_idx ON projects(category_id, slug);

-- RLS Policies for public read access
CREATE POLICY "Categories are publicly readable"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Projects are publicly readable"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Project images are publicly readable"
  ON project_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for authenticated admin access
CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage project images"
  ON project_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('3D', '3d', 1),
  ('DESIGN', 'design', 2),
  ('MUSIC', 'music', 3),
  ('ESSAYS', 'essays', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample projects for 3D category
DO $$
DECLARE
  category_3d_id uuid;
  project_id uuid;
BEGIN
  SELECT id INTO category_3d_id FROM categories WHERE slug = '3d';
  
  -- Digital Sculpture 01
  INSERT INTO projects (title, slug, description, category_id, display_order)
  VALUES ('DIGITAL SCULPTURE 01', 'sculpture-01', 'This project explores the intersection of minimalism and digital craft. Through careful consideration of form, function, and negative space, the work achieves a balance between aesthetic simplicity and conceptual depth.', category_3d_id, 1)
  RETURNING id INTO project_id;
  
  INSERT INTO project_images (project_id, image_url, alt_text, display_order, is_thumbnail) VALUES
    (project_id, 'https://images.pexels.com/photos/14936142/pexels-photo-14936142.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Digital Sculpture 01 - Main View', 1, true),
    (project_id, 'https://images.pexels.com/photos/8847434/pexels-photo-8847434.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Digital Sculpture 01 - Detail View', 2, false),
    (project_id, 'https://images.pexels.com/photos/17832031/pexels-photo-17832031.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Digital Sculpture 01 - Alternative Angle', 3, false);

  -- Abstract Forms
  INSERT INTO projects (title, slug, description, category_id, display_order)
  VALUES ('ABSTRACT FORMS', 'abstract-forms', 'An exploration of geometric abstraction through digital mediums, focusing on the relationship between form and space.', category_3d_id, 2)
  RETURNING id INTO project_id;
  
  INSERT INTO project_images (project_id, image_url, alt_text, display_order, is_thumbnail) VALUES
    (project_id, 'https://images.pexels.com/photos/8847434/pexels-photo-8847434.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Abstract Forms - Primary', 1, true),
    (project_id, 'https://images.pexels.com/photos/18479658/pexels-photo-18479658.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Abstract Forms - Secondary', 2, false);
END $$;

-- Insert sample projects for Design category
DO $$
DECLARE
  category_design_id uuid;
  project_id uuid;
BEGIN
  SELECT id INTO category_design_id FROM categories WHERE slug = 'design';
  
  -- Brand Identity
  INSERT INTO projects (title, slug, description, category_id, display_order)
  VALUES ('BRAND IDENTITY', 'brand-identity', 'A comprehensive brand identity system exploring minimal typography and geometric forms.', category_design_id, 1)
  RETURNING id INTO project_id;
  
  INSERT INTO project_images (project_id, image_url, alt_text, display_order, is_thumbnail) VALUES
    (project_id, 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Brand Identity - Logo System', 1, true),
    (project_id, 'https://images.pexels.com/photos/7135037/pexels-photo-7135037.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Brand Identity - Applications', 2, false),
    (project_id, 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Brand Identity - Stationery', 3, false),
    (project_id, 'https://images.pexels.com/photos/7135038/pexels-photo-7135038.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Brand Identity - Guidelines', 4, false);
END $$;

-- Insert sample projects for Music category
DO $$
DECLARE
  category_music_id uuid;
  project_id uuid;
BEGIN
  SELECT id INTO category_music_id FROM categories WHERE slug = 'music';
  
  -- Ambient 01
  INSERT INTO projects (title, slug, description, category_id, display_order)
  VALUES ('AMBIENT 01', 'ambient-01', 'An ambient composition exploring the relationship between sound and silence in digital spaces.', category_music_id, 1)
  RETURNING id INTO project_id;
  
  INSERT INTO project_images (project_id, image_url, alt_text, display_order, is_thumbnail) VALUES
    (project_id, 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Ambient 01 - Waveform', 1, true),
    (project_id, 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Ambient 01 - Studio Setup', 2, false);
END $$;

-- Insert sample projects for Essays category
DO $$
DECLARE
  category_essays_id uuid;
  project_id uuid;
BEGIN
  SELECT id INTO category_essays_id FROM categories WHERE slug = 'essays';
  
  -- Digital Minimalism
  INSERT INTO projects (title, slug, description, category_id, display_order)
  VALUES ('DIGITAL MINIMALISM', 'digital-minimalism', 'An exploration of minimalist principles in digital design and their impact on user experience.', category_essays_id, 1)
  RETURNING id INTO project_id;
  
  INSERT INTO project_images (project_id, image_url, alt_text, display_order, is_thumbnail) VALUES
    (project_id, 'https://images.pexels.com/photos/159581/dictionary-reference-book-learning-meaning-159581.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Digital Minimalism - Essay Cover', 1, true);
END $$;