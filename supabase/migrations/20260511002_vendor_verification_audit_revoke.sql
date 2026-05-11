-- PACAA-515 Phase B1 — is_verified audit + evidence-missing revocation (LC §5-A/B)
-- Applied: 2026-05-11
-- GATE: apply ONLY after 20260511001_vendor_evidence_schema.sql is confirmed in prod
--       AND CEO has reviewed the Step 2 audit report (row count).
--
-- Decision rule (from PACAA-515 Acceptance §Step 3):
--   • evidence_missing (any of §1.1-§1.4 NULL) → is_verified=false + reason=audit_2026Q2_evidence_missing
--   • BRN inactive                              → is_verified=false + reason=brn_inactive
--   • contact_missing (§1.5 NULL)               → 90-day grace period; NOT revoked here
--
-- Rollback: UPDATE companies SET is_verified=true, verification_revoked_reason=NULL,
--           verification_revoked_at=NULL WHERE verification_revoked_reason='audit_2026Q2_evidence_missing';

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 2 diagnostic (dry-run): audit all is_verified=true rows
-- Run this SELECT first to get the impact count before the UPDATE below.
-- ─────────────────────────────────────────────────────────────────────────────

/*
SELECT
  v.id,
  v.brn,
  v.name,
  -- §1.1-1.2: BRN check (stale = checked_at > 12 months ago or NULL)
  (brn_latest.checked_at IS NULL
    OR brn_latest.checked_at < NOW() - INTERVAL '12 months') AS brn_missing_or_stale,
  -- BRN inactive (휴업/폐업/말소)
  (brn_latest.status IN ('suspended', 'closed', 'cancelled'))  AS brn_inactive,
  -- §1.3: domain check (last_ok_at > 12 months ago or NULL)
  (dom_latest.last_ok_at IS NULL
    OR dom_latest.last_ok_at < NOW() - INTERVAL '12 months')   AS domain_missing_or_stale,
  -- §1.4: telesales check (NULL or not found/not exempt)
  (tel_latest.result IS NULL OR tel_latest.result = 'not_found') AS telesales_missing,
  -- §1.5: contact check (confirmed_at NULL → grace period, not revoked here)
  (con_latest.confirmed_at IS NULL)                             AS contact_missing
FROM companies v
LEFT JOIN LATERAL (
  SELECT status, checked_at
  FROM vendor_brn_checks
  WHERE vendor_id = v.id
  ORDER BY checked_at DESC LIMIT 1
) brn_latest ON true
LEFT JOIN LATERAL (
  SELECT last_ok_at
  FROM vendor_domain_checks
  WHERE vendor_id = v.id
  ORDER BY checked_at DESC LIMIT 1
) dom_latest ON true
LEFT JOIN LATERAL (
  SELECT result
  FROM vendor_telesales_checks
  WHERE vendor_id = v.id
  ORDER BY checked_at DESC LIMIT 1
) tel_latest ON true
LEFT JOIN LATERAL (
  SELECT confirmed_at
  FROM vendor_contact_checks
  WHERE vendor_id = v.id
  ORDER BY created_at DESC LIMIT 1
) con_latest ON true
WHERE v.is_verified = true
ORDER BY v.id;
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 3-A: BRN inactive → immediate revocation (LC §3.1)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE companies v
SET
  is_verified                = false,
  verification_revoked_reason = 'brn_inactive',
  verification_revoked_at    = NOW()
FROM (
  SELECT DISTINCT ON (vendor_id) vendor_id, status
  FROM vendor_brn_checks
  ORDER BY vendor_id, checked_at DESC
) brn_latest
WHERE v.id = brn_latest.vendor_id
  AND v.is_verified = true
  AND brn_latest.status IN ('suspended', 'closed', 'cancelled');

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 3-B: evidence_missing → revocation for all remaining §1.1-§1.4 gaps
--           (§1.5 contact_missing → 90-day grace only, NOT revoked here)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE companies v
SET
  is_verified                = false,
  verification_revoked_reason = 'audit_2026Q2_evidence_missing',
  verification_revoked_at    = NOW()
FROM (
  -- Subquery: find vendors missing any of §1.1-§1.4 evidence
  SELECT
    v2.id AS vendor_id,
    (brn_latest.checked_at IS NULL OR brn_latest.checked_at < NOW() - INTERVAL '12 months') AS brn_gap,
    (dom_latest.last_ok_at IS NULL OR dom_latest.last_ok_at < NOW() - INTERVAL '12 months') AS domain_gap,
    (tel_latest.result IS NULL OR tel_latest.result = 'not_found')                           AS telesales_gap
  FROM companies v2
  LEFT JOIN LATERAL (
    SELECT checked_at, status
    FROM vendor_brn_checks
    WHERE vendor_id = v2.id
    ORDER BY checked_at DESC LIMIT 1
  ) brn_latest ON true
  LEFT JOIN LATERAL (
    SELECT last_ok_at
    FROM vendor_domain_checks
    WHERE vendor_id = v2.id
    ORDER BY checked_at DESC LIMIT 1
  ) dom_latest ON true
  LEFT JOIN LATERAL (
    SELECT result
    FROM vendor_telesales_checks
    WHERE vendor_id = v2.id
    ORDER BY checked_at DESC LIMIT 1
  ) tel_latest ON true
  WHERE v2.is_verified = true
    AND v2.verification_revoked_reason IS NULL  -- skip rows already revoked by 3-A
) audit
WHERE v.id = audit.vendor_id
  AND (audit.brn_gap OR audit.domain_gap OR audit.telesales_gap);

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 3-C: contact_missing (§1.5) → record 90-day grace period start
--           (these vendors STAY is_verified=true for now; follow-up child
--            issue to be raised by PACAA-515 completion comment)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO vendor_contact_checks (vendor_id, channel, grace_period_start_at)
SELECT
  v.id,
  'email' AS channel,
  NOW()   AS grace_period_start_at
FROM companies v
LEFT JOIN vendor_contact_checks con ON con.vendor_id = v.id AND con.confirmed_at IS NOT NULL
WHERE v.is_verified = true
  AND con.vendor_id IS NULL
  -- Exclude already-revoked rows
  AND v.verification_revoked_reason IS NULL
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 2 post-run count (run after UPDATE to confirm impact distribution)
-- ─────────────────────────────────────────────────────────────────────────────

/*
SELECT verification_revoked_reason, COUNT(*) AS cnt
FROM companies
WHERE verification_revoked_reason IS NOT NULL
GROUP BY verification_revoked_reason
ORDER BY cnt DESC;

SELECT COUNT(*) AS still_verified FROM companies WHERE is_verified = true;
SELECT COUNT(*) AS revoked_total  FROM companies WHERE is_verified = false AND verification_revoked_reason IS NOT NULL;
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE companies
-- SET is_verified = true,
--     verification_revoked_reason = NULL,
--     verification_revoked_at = NULL
-- WHERE verification_revoked_reason IN ('audit_2026Q2_evidence_missing', 'brn_inactive')
--   AND verification_revoked_at >= '2026-05-11';
