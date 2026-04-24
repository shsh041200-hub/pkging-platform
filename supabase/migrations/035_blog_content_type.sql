-- KOR-345: Add content_type to distinguish blog posts from guides
-- Supports /blog (content_type='blog') and /guides (content_type='guide') routes

ALTER TABLE blog_posts
  ADD COLUMN content_type text NOT NULL DEFAULT 'blog'
    CHECK (content_type IN ('blog', 'guide'));

ALTER TABLE blog_posts
  ADD COLUMN faq_items jsonb DEFAULT NULL;

CREATE INDEX idx_blog_posts_content_type ON blog_posts (content_type);
