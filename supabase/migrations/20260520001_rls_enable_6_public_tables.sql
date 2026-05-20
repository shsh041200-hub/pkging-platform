-- PACAA-949: RLS enable — 6 public tables
-- Board decision (PACAA-948 interaction 5c47ca0c): Option A — CTO delegation
--
-- Design:
--   Reference tables (FE anon read required):
--     korean_search_synonyms — read by search_companies_korean RPC via anon client
--     use_case_tags          — read by FE pages/API routes via anon client
--     slug_redirects         — read by middleware via anon key raw fetch
--   Internal tables (service_role only, anon read forbidden):
--     crawl_ai_usage         — internal AI cost tracking, no FE access
--     _applied_migrations    — internal migration state, no FE access
--     slug_history           — internal slug audit log, no FE access
--
-- Note: service_role bypasses RLS automatically in Supabase, so no
-- explicit service_role policies are needed for mutation or internal tables.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. korean_search_synonyms
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.korean_search_synonyms ENABLE ROW LEVEL SECURITY;

-- anon + authenticated may SELECT (used by search_companies_korean RPC)
CREATE POLICY "korean_search_synonyms_anon_select"
  ON public.korean_search_synonyms
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT / UPDATE / DELETE: service_role only (bypasses RLS; no policy needed)

-- ────────────────────────────────────────────────────────────────────────────
-- 2. use_case_tags
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.use_case_tags ENABLE ROW LEVEL SECURITY;

-- anon + authenticated may SELECT (used by FE pages and /api/use-case-tags)
CREATE POLICY "use_case_tags_anon_select"
  ON public.use_case_tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT / UPDATE / DELETE: service_role only (bypasses RLS; no policy needed)

-- ────────────────────────────────────────────────────────────────────────────
-- 3. slug_redirects
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.slug_redirects ENABLE ROW LEVEL SECURITY;

-- anon may SELECT (used by Next.js middleware via raw fetch with anon key)
CREATE POLICY "slug_redirects_anon_select"
  ON public.slug_redirects
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT / UPDATE / DELETE: service_role only (bypasses RLS; no policy needed)

-- ────────────────────────────────────────────────────────────────────────────
-- 4. crawl_ai_usage  (internal — no anon access)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.crawl_ai_usage ENABLE ROW LEVEL SECURITY;
-- No policies created: anon/authenticated are blocked by default.
-- service_role bypasses RLS and retains full access.

-- ────────────────────────────────────────────────────────────────────────────
-- 5. _applied_migrations  (internal — no anon access)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public._applied_migrations ENABLE ROW LEVEL SECURITY;
-- No policies created: anon/authenticated are blocked by default.
-- service_role bypasses RLS and retains full access.

-- ────────────────────────────────────────────────────────────────────────────
-- 6. slug_history  (internal — no anon access)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.slug_history ENABLE ROW LEVEL SECURITY;
-- No policies created: anon/authenticated are blocked by default.
-- service_role bypasses RLS and retains full access.
