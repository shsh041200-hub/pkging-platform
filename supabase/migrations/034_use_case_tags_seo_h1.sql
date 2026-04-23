-- Migration 034: Add seo_h1 to use_case_tags and update confirmed seed data
-- KOR-338 / KOR-336: CMO keyword research finalized landing page SEO metadata.

-- ── UP ──────────────────────────────────────────────────────────────────────

ALTER TABLE use_case_tags ADD COLUMN IF NOT EXISTS seo_h1 TEXT;

-- Update confirmed SEO values for the moving-storage-box tag.
-- ON CONFLICT (slug) DO UPDATE ensures we patch even if the row already exists.
INSERT INTO use_case_tags (slug, label, description, parent_industry, seo_slug, seo_title, seo_description, seo_h1, icon)
VALUES (
  'moving-storage-box',
  '이사·보관 박스',
  '이사, 보관, 정리용 박스 전문',
  'ecommerce-shipping',
  '이사박스',
  '이사 박스 제조사·도매 공급업체 비교 | B2B 패키징 플랫폼 Packlinx',
  '이사업체·물류사를 위한 골판지·단프라 이사 박스 B2B 도매 공급업체를 한 곳에서 비교하세요. 전국 검증 제조사 네트워크, 무료 견적 요청 가능.',
  '이사 박스 제조사·도매 업체, 한 곳에서 비교하세요',
  '📦'
)
ON CONFLICT (slug) DO UPDATE SET
  seo_title       = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_h1          = EXCLUDED.seo_h1,
  seo_slug        = EXCLUDED.seo_slug;

-- ── DOWN ────────────────────────────────────────────────────────────────────
-- To revert:
--
-- ALTER TABLE use_case_tags DROP COLUMN IF EXISTS seo_h1;
