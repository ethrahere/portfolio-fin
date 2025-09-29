/*
  Fix video table structure to support multiple videos per project

  This migration restructures the project_video table to follow the same pattern
  as project_images and project_audio, allowing multiple videos per project.
*/

-- Create new project_videos table with proper structure
CREATE TABLE IF NOT EXISTS project_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  title text DEFAULT '',
  display_order integer DEFAULT 0,
  is_thumbnail boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE project_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new table
CREATE POLICY "Project videos are publicly readable" ON project_videos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage project videos" ON project_videos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Migrate existing data from old project_video table to new project_videos table
INSERT INTO project_videos (project_id, video_url, title, display_order, is_thumbnail, created_at)
SELECT
  id as project_id,
  video_url,
  '' as title,
  1 as display_order,
  true as is_thumbnail,
  created_at
FROM project_video
WHERE video_url IS NOT NULL;

-- Drop the old table (comment this out if you want to keep the old data temporarily)
-- DROP TABLE IF EXISTS project_video;

-- For safety, let's rename the old table instead of dropping it
ALTER TABLE project_video RENAME TO project_video_old;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS project_videos_project_id_idx ON project_videos(project_id);
CREATE INDEX IF NOT EXISTS project_videos_display_order_idx ON project_videos(project_id, display_order);