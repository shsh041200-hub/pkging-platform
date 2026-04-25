-- Extend opt_out_requests to support 'takedown' request type
-- Required by Korean 정보통신망법 §44조의2 (KOR-546)

-- Drop auto-generated CHECK constraint on request_type
ALTER TABLE opt_out_requests
  DROP CONSTRAINT IF EXISTS opt_out_requests_request_type_check;

-- Re-add CHECK constraint with 'takedown' included
ALTER TABLE opt_out_requests
  ADD CONSTRAINT opt_out_requests_request_type_check
    CHECK (request_type IN ('delete', 'update', 'takedown'));

-- Add takedown_url column: stores the URL of the allegedly infringing content
ALTER TABLE opt_out_requests
  ADD COLUMN IF NOT EXISTS takedown_url TEXT;

-- Down migration (if needed):
--   ALTER TABLE opt_out_requests DROP COLUMN IF EXISTS takedown_url;
--   ALTER TABLE opt_out_requests DROP CONSTRAINT IF EXISTS opt_out_requests_request_type_check;
--   ALTER TABLE opt_out_requests ADD CONSTRAINT opt_out_requests_request_type_check CHECK (request_type IN ('delete', 'update'));
