-- KOR-183: Add 'b2b_directory' to companies data_source constraint
-- Enables storing companies crawled from B2B trade directories (e.g. tradekorea.com)

ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_data_source_check;

ALTER TABLE companies
  ADD CONSTRAINT companies_data_source_check CHECK (
    data_source IN (
      'naver_local',
      'public_data_portal',
      'manual',
      'website_crawl',
      'association',
      'b2b_directory'
    )
  );
