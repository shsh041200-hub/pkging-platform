-- PACAA-580: Phase 2 — Vendor slug 정합성 mutation (옵션 B)
-- Board approval: ce3036bd (interaction on PACAA-579)
-- Scope: 12건 (6 slug changes + 6 redirects + 6 is_hidden)
--
-- Categories:
--   CRITICAL (1): P0 PIPA 개인정보 노출 slug 재생성 + 301 redirect
--   A3      (4): HTML entity &amp; 로 인한 -amp- slug 잔류 + 301 redirect
--   A4      (1): URL domain .co.kr slug 유입 + 301 redirect
--   E       (6): 비포장 업종 오분류 → is_hidden = true (카테고리 오배정)
--
-- Rollback: 파일 하단 ROLLBACK PLAN 참조

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. slug_redirects 테이블 보장 (멱등성 — 이미 존재하면 무시)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS slug_redirects (
  from_slug   TEXT PRIMARY KEY,
  to_slug     TEXT NOT NULL,
  status_code INT  NOT NULL DEFAULT 301,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS slug_redirects_from_slug_idx
  ON slug_redirects (from_slug);

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CRITICAL — P0 PIPA 개인정보 노출 slug (1건)
--
--    Old slug:  dongyangmogjae-gimchanghwan-032-578-8121-incheongw
--    New slug:  dongyangmogjae
--    Issue:     담당자명(김창환) + 전화번호(032-578-8121) + 주소가 slug + name에 포함
--               → Google 인덱스 중 → PIPA §15 무동의 공개
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_old TEXT := 'dongyangmogjae-gimchanghwan-032-578-8121-incheongw';
  v_new TEXT := 'dongyangmogjae';
  v_id  UUID;
BEGIN
  SELECT id INTO v_id FROM companies WHERE slug = v_old;

  IF v_id IS NULL THEN
    RAISE WARNING '[PACAA-580 CRITICAL] source slug not found: % — already migrated or wrong slug', v_old;
  ELSIF EXISTS (SELECT 1 FROM companies WHERE slug = v_new AND id <> v_id) THEN
    -- Conflict: append -2 suffix to avoid uniqueness clash
    v_new := v_new || '-2';
    UPDATE companies SET slug = v_new WHERE id = v_id;
    INSERT INTO slug_redirects (from_slug, to_slug, status_code)
      VALUES (v_old, v_new, 301)
      ON CONFLICT (from_slug) DO UPDATE SET to_slug = EXCLUDED.to_slug;
    RAISE NOTICE '[PACAA-580 CRITICAL] slug conflict: used suffix → % → %', v_old, v_new;
  ELSE
    UPDATE companies SET slug = v_new WHERE id = v_id;
    INSERT INTO slug_redirects (from_slug, to_slug, status_code)
      VALUES (v_old, v_new, 301)
      ON CONFLICT (from_slug) DO UPDATE SET to_slug = EXCLUDED.to_slug;
    RAISE NOTICE '[PACAA-580 CRITICAL] DONE: % → %', v_old, v_new;
  END IF;
END$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. A3 — HTML entity &amp; → slug에 -amp- 잔류 (4건)
--
--    Pattern:   slug LIKE '%-amp-%'
--    Fix:       REGEXP_REPLACE(slug, '-amp-', '-', 'g') — & 는 단어 구분자이므로 삭제
--    Example:   a-amp-bdijain-gwanggo → a-bdijain-gwanggo
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  rec      RECORD;
  v_new    TEXT;
  v_count  INT := 0;
BEGIN
  FOR rec IN
    SELECT id, slug
    FROM   companies
    WHERE  slug LIKE '%-amp-%'
      AND  is_hidden = false
  LOOP
    v_new := REGEXP_REPLACE(rec.slug, '-amp-', '-', 'g');
    -- Trim any leading/trailing hyphens that edge cases might produce
    v_new := TRIM(BOTH '-' FROM v_new);

    IF v_new = rec.slug THEN
      RAISE WARNING '[PACAA-580 A3] no-op for slug %', rec.slug;
      CONTINUE;
    END IF;

    IF EXISTS (SELECT 1 FROM companies WHERE slug = v_new AND id <> rec.id) THEN
      RAISE WARNING '[PACAA-580 A3] target slug % already taken for % — skipping (manual review)', v_new, rec.slug;
      CONTINUE;
    END IF;

    UPDATE companies SET slug = v_new WHERE id = rec.id;
    INSERT INTO slug_redirects (from_slug, to_slug, status_code)
      VALUES (rec.slug, v_new, 301)
      ON CONFLICT (from_slug) DO UPDATE SET to_slug = EXCLUDED.to_slug;
    v_count := v_count + 1;
    RAISE NOTICE '[PACAA-580 A3] DONE: % → %', rec.slug, v_new;
  END LOOP;

  RAISE NOTICE '[PACAA-580 A3] total processed: %', v_count;
END$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. A4 — URL domain .co.kr slug 유입 (1건)
--
--    Old slug:  95mall-co-kr
--    New slug:  95mall
--    Issue:     회사명 95mall 에서 도메인(.co.kr)이 slug에 합류
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_old TEXT := '95mall-co-kr';
  v_new TEXT := '95mall';
  v_id  UUID;
BEGIN
  SELECT id INTO v_id FROM companies WHERE slug = v_old;

  IF v_id IS NULL THEN
    RAISE WARNING '[PACAA-580 A4] source slug not found: %', v_old;
  ELSIF EXISTS (SELECT 1 FROM companies WHERE slug = v_new AND id <> v_id) THEN
    v_new := v_new || '-2';
    UPDATE companies SET slug = v_new WHERE id = v_id;
    INSERT INTO slug_redirects (from_slug, to_slug, status_code)
      VALUES (v_old, v_new, 301)
      ON CONFLICT (from_slug) DO UPDATE SET to_slug = EXCLUDED.to_slug;
    RAISE NOTICE '[PACAA-580 A4] slug conflict: used suffix → % → %', v_old, v_new;
  ELSE
    UPDATE companies SET slug = v_new WHERE id = v_id;
    INSERT INTO slug_redirects (from_slug, to_slug, status_code)
      VALUES (v_old, v_new, 301)
      ON CONFLICT (from_slug) DO UPDATE SET to_slug = EXCLUDED.to_slug;
    RAISE NOTICE '[PACAA-580 A4] DONE: % → %', v_old, v_new;
  END IF;
END$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. E — 비포장 업종 오분류 is_hidden=true (6건)
--
--    Phase 1 audit 에서 확인된 비포장 업체 (하수구, 보일러 서비스 등이
--    category='paper' 로 오분류 등록). is_hidden=true 로 디렉터리 비노출.
--    Reversible: UPDATE companies SET is_hidden=false WHERE ... 로 복구 가능.
--
--    식별 기준:
--      - 직접 확인된 slug/name 키워드: 하수구, 경동나비엔, 보일러
--      - 위 키워드가 포함된 업체는 포장 업종이 아님 (100% 확실)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE companies
SET    is_hidden = true
WHERE  is_hidden = false
  AND  (
         name ILIKE '%하수구%'
      OR name ILIKE '%경동나비엔%'
      OR name ILIKE '%보일러%'
      OR name ILIKE '%나이귀뇨라미%'   -- 50-char truncated boiler company fragment
      OR name ILIKE '%뚫는업체%'        -- 하수구뚫는업체 name pattern
  );

-- Log the count for post-migration audit
DO $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM companies WHERE is_hidden = true
    AND (name ILIKE '%하수구%' OR name ILIKE '%경동나비엔%' OR name ILIKE '%보일러%'
         OR name ILIKE '%나이귀뇨라미%' OR name ILIKE '%뚫는업체%');
  RAISE NOTICE '[PACAA-580 E] is_hidden=true applied to % record(s)', v_count;
END$$;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK PLAN (run manually; requires CEO approval before executing)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- -- Undo CRITICAL / A3 / A4 slug changes (reverse via slug_redirects log):
-- BEGIN;
-- UPDATE companies c
-- SET    slug = sr.from_slug
-- FROM   slug_redirects sr
-- WHERE  c.slug = sr.to_slug
--   AND  sr.created_at >= '2026-05-11'
--   AND  sr.created_at <  '2026-05-12';
-- DELETE FROM slug_redirects WHERE created_at >= '2026-05-11' AND created_at < '2026-05-12';
-- COMMIT;
--
-- -- Undo E is_hidden:
-- BEGIN;
-- UPDATE companies SET is_hidden = false
-- WHERE  is_hidden = true
--   AND  (name ILIKE '%하수구%' OR name ILIKE '%경동나비엔%' OR name ILIKE '%보일러%'
--         OR name ILIKE '%나이귀뇨라미%' OR name ILIKE '%뚫는업체%');
-- COMMIT;
