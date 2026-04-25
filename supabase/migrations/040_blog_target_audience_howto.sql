-- KOR-494: Add target_audience and howto_steps columns for guide pages
-- target_audience: string array shown as recommendation box
-- howto_steps: JSON array for HowTo structured data (schema.org)

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS target_audience jsonb DEFAULT NULL;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS howto_steps jsonb DEFAULT NULL;
