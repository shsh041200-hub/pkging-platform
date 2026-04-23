-- Migration 033: Use-case tag system
-- Adds use_case_tags definition table and attaches use_case_tags[] column to companies.
-- KOR-338: use-case tag DB schema + API implementation.

-- ── UP ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS use_case_tags (
  id               UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT      UNIQUE NOT NULL,
  label            TEXT      NOT NULL,
  description      TEXT,
  parent_industry  TEXT      NOT NULL,
  seo_title        TEXT,
  seo_description  TEXT,
  seo_slug         TEXT,
  icon             TEXT      DEFAULT '📦',
  sort_order       INT       DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_use_case_tags_parent_industry
  ON use_case_tags (parent_industry);

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS use_case_tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_companies_use_case_tags
  ON companies USING GIN (use_case_tags);

-- Seed: moving/storage box use-case tag
INSERT INTO use_case_tags (slug, label, description, parent_industry, seo_slug, icon)
VALUES (
  'moving-storage-box',
  '이사·보관 박스',
  '이사, 보관, 정리용 박스 전문',
  'ecommerce-shipping',
  '이사박스',
  '📦'
)
ON CONFLICT (slug) DO NOTHING;

-- ── DOWN ────────────────────────────────────────────────────────────────────
-- To revert:
--
-- DROP INDEX IF EXISTS idx_companies_use_case_tags;
-- ALTER TABLE companies DROP COLUMN IF EXISTS use_case_tags;
-- DROP INDEX IF EXISTS idx_use_case_tags_parent_industry;
-- DROP TABLE IF EXISTS use_case_tags;
