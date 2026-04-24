-- KOR-374: Add classification metadata columns and AI usage tracking

ALTER TABLE companies ADD COLUMN IF NOT EXISTS needs_category_review boolean DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS classification_method text;

CREATE TABLE IF NOT EXISTS crawl_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_date date NOT NULL UNIQUE,
  call_count integer DEFAULT 0,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
