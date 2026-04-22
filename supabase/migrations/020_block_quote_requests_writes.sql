-- Block all write paths to quote_requests.
-- Table preserved read-only for historical data. Board directed permanent removal of the feature.

DROP POLICY IF EXISTS "public_insert_quote_requests" ON quote_requests;

CREATE POLICY "deny_insert_quote_requests"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);
