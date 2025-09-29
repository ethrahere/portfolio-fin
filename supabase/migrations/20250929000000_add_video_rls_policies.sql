/*
  Add RLS policies for project_video table

  This migration adds the necessary Row Level Security policies for the project_video table
  to allow public read access and authenticated admin write access.
*/

-- Enable RLS on project_video table if not already enabled
ALTER TABLE project_video ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access (portfolio is public)
CREATE POLICY "Project videos are publicly readable"
  ON project_video
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add policy for authenticated admin access for CRUD operations
CREATE POLICY "Authenticated users can manage project videos"
  ON project_video
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);