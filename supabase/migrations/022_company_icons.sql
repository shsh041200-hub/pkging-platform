-- KOR-221: Add icon columns for favicon pipeline
-- Parent: KOR-220 (업체 favicon/로고 자동 수집 및 카드 표시 구현)

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS icon_url        text,
  ADD COLUMN IF NOT EXISTS icon_fetched_at timestamptz;

-- Index for pipeline queries: find companies that need icon fetch
CREATE INDEX IF NOT EXISTS idx_companies_icon_url_null
  ON companies (id)
  WHERE icon_url IS NULL AND website IS NOT NULL;

-- Down migration:
-- ALTER TABLE companies DROP COLUMN IF EXISTS icon_url;
-- ALTER TABLE companies DROP COLUMN IF EXISTS icon_fetched_at;
-- DROP INDEX IF EXISTS idx_companies_icon_url_null;
