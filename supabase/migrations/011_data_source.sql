-- Add data_source column to companies table for origin tracking
-- Allowed values: naver_local, public_data_portal, manual, website_crawl

alter table companies
  add column if not exists data_source text check (
    data_source in ('naver_local', 'public_data_portal', 'manual', 'website_crawl')
  ) default 'manual';

-- Backfill existing records with 'manual' as the default source
update companies set data_source = 'manual' where data_source is null;
