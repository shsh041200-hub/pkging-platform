-- keyword_pages: persistent metadata for each SEO landing page.
-- Replaces the in-code KEYWORD_REGISTRY in lib/keyword-data.ts once
-- the keyword slate is finalised and CMS-editable metadata is needed.
--
-- Status: PENDING (not yet applied)
-- After applying: update lib/keyword-data.ts to query this table instead of KEYWORD_REGISTRY.

CREATE TABLE IF NOT EXISTS keyword_pages (
  slug           TEXT PRIMARY KEY,
  title_ko       TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  -- Maps to companies.category ('paper' | 'plastic' | 'flexible' | 'eco' | 'glass' | 'metal')
  category       TEXT NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER keyword_pages_updated_at
  BEFORE UPDATE ON keyword_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed: test keyword (validates Supabase connection)
INSERT INTO keyword_pages (slug, title_ko, description_ko, category)
VALUES (
  'test-keyword',
  '테스트 키워드 포장재 공급업체',
  '국내 최고의 테스트 키워드 관련 포장재 공급업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.',
  'paper'
)
ON CONFLICT (slug) DO NOTHING;

-- RLS: public read, authenticated write (apply after creating the table)
ALTER TABLE keyword_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read keyword_pages"
  ON keyword_pages FOR SELECT USING (is_active = TRUE);
