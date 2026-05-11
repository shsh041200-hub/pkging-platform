-- PACAA-580: Phase 2 E-category patch — 6th record not caught by 20260511003
--
-- Root cause: 20260511003 had typo '%나이귀뇨라미%' → should be '%귀뚜라미%'
-- This patch adds the corrected pattern and applies is_hidden=true to any missed records.
--
-- Rollback:
--   UPDATE companies SET is_hidden = false
--   WHERE is_hidden = true AND name ILIKE '%귀뚜라미%'
--     AND name NOT ILIKE '%경동나비엔%' AND name NOT ILIKE '%보일러%';

DO $$
DECLARE v_count INT;
BEGIN
  UPDATE companies
  SET    is_hidden = true
  WHERE  is_hidden = false
    AND  name ILIKE '%귀뚜라미%';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '[PACAA-580 E-patch] is_hidden=true applied to % record(s) via %%귀뚜라미%%', v_count;
END$$;
