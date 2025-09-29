/*
  Fix RLS policies for project_video table

  This migration drops existing policies and recreates them with proper permissions
  for the specific table structure where id is both primary key and foreign key to projects.
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Project videos are publicly readable" ON project_video;
DROP POLICY IF EXISTS "Authenticated users can manage project videos" ON project_video;

-- Ensure RLS is enabled
ALTER TABLE project_video ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view videos)
CREATE POLICY "Enable read access for all users" ON project_video
  FOR SELECT USING (true);

-- Policy for authenticated users to insert videos
CREATE POLICY "Enable insert for authenticated users only" ON project_video
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update videos
CREATE POLICY "Enable update for authenticated users only" ON project_video
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to delete videos
CREATE POLICY "Enable delete for authenticated users only" ON project_video
  FOR DELETE
  TO authenticated
  USING (true);

-- Also ensure the 'video' storage bucket has proper policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video',
  'video',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

-- Storage policies for video bucket
CREATE POLICY "Anyone can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'video');

CREATE POLICY "Authenticated users can upload videos" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'video');

CREATE POLICY "Authenticated users can update videos" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'video');

CREATE POLICY "Authenticated users can delete videos" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'video');