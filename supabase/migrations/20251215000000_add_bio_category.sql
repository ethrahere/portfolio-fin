-- Add BIO category to the categories table
INSERT INTO categories (name, slug, display_order) VALUES
  ('BIO', 'bio', 6)
ON CONFLICT (slug) DO NOTHING;
