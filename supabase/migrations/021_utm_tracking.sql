-- KOR-197: UTM parameter tracking for Naver Blog campaign attribution
-- Add dedicated UTM columns to conversion_events for efficient filtering

ALTER TABLE conversion_events
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

CREATE INDEX IF NOT EXISTS idx_conversion_events_utm_source
  ON conversion_events (utm_source, created_at DESC)
  WHERE utm_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversion_events_utm_campaign
  ON conversion_events (utm_campaign, created_at DESC)
  WHERE utm_campaign IS NOT NULL;
