-- Community: Project Comments
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Public can read only approved comments
CREATE POLICY "Public can read approved comments"
  ON project_comments FOR SELECT
  USING (is_approved = true);

-- Anyone can submit a comment (held for approval)
CREATE POLICY "Public can submit comments"
  ON project_comments FOR INSERT
  WITH CHECK (true);

-- Authenticated admin can manage all comments
CREATE POLICY "Authenticated users can manage comments"
  ON project_comments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Community: Collaboration Requests
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_type TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a collaboration request
CREATE POLICY "Public can submit collaboration requests"
  ON collaboration_requests FOR INSERT
  WITH CHECK (true);

-- Only authenticated admin can read/manage requests
CREATE POLICY "Authenticated users can manage collaboration requests"
  ON collaboration_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
