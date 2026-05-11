-- PACAA-515 Phase B1 — vendor evidence schema (LC §1 5종 기준)
-- Applied: 2026-05-11
-- Purpose: evidence tables for is_verified audit trail. All tables start empty —
--          existing is_verified=true rows have NULL evidence → fail audit by definition.
-- Rollback: see rollback section at bottom.

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Extend companies table with revocation tracking columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS verification_revoked_reason TEXT,
  ADD COLUMN IF NOT EXISTS verification_revoked_at      TIMESTAMPTZ;

COMMENT ON COLUMN companies.verification_revoked_reason IS
  'Populated when is_verified transitions false. Values: audit_2026Q2_evidence_missing | brn_inactive | domain_down_14d | contact_unreachable_90d | telesales_revoked | vendor_request | fact_check_failed | regulatory_action';

COMMENT ON COLUMN companies.verification_revoked_at IS
  'Timestamp of the revocation event. NULL when is_verified=true or never verified.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. vendor_brn_checks — LC §1 기준 1+2 (BRN validity + name match)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_brn_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  -- BRN status returned by 국세청 API
  status          TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'closed', 'cancelled', 'unknown')),
  -- Raw name from 국세청 (before normalisation)
  raw_name        TEXT,
  -- Normalised vendor name used for comparison
  normalised_name TEXT,
  -- Whether normalised names match (LC §1.2)
  name_match      BOOLEAN,
  -- Rule ID used for normalisation (for audit reproducibility)
  normalisation_rule_id TEXT,
  -- Full raw API response payload (JSON string, stripped of PII per PIPA §15)
  raw_payload     JSONB,
  checked_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendor_brn_checks_vendor_id_idx
  ON vendor_brn_checks(vendor_id, checked_at DESC);

COMMENT ON TABLE vendor_brn_checks IS
  'LC §1.1-1.2: 사업자등록 상태 + 명의 일치 검증 evidence. checked_at > 12개월이면 stale.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. vendor_domain_checks — LC §1 기준 3 (website domain validity)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_domain_checks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  domain         TEXT NOT NULL,
  status_code    INTEGER,
  redirect_chain JSONB,  -- array of {url, status_code}
  -- WHOIS registrant info (PII-stripped) to cross-check with BRN owner
  whois_excerpt  TEXT,
  last_ok_at     TIMESTAMPTZ,  -- NULL if never confirmed OK
  checked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendor_domain_checks_vendor_id_idx
  ON vendor_domain_checks(vendor_id, checked_at DESC);

COMMENT ON TABLE vendor_domain_checks IS
  'LC §1.3: 웹사이트 도메인 실재성 + WHOIS 교차 검증 evidence. last_ok_at NULL 또는 >12개월이면 stale.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. vendor_telesales_checks — LC §1 기준 4 (통신판매업 신고)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_telesales_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  brn         TEXT NOT NULL,
  -- 'found' | 'not_found' | 'exempt' (제조업 등 미해당)
  result      TEXT NOT NULL CHECK (result IN ('found', 'not_found', 'exempt')),
  -- Required when result='exempt': reason for exemption
  exempt_reason TEXT,
  found_at    TIMESTAMPTZ,   -- populated when result='found'
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendor_telesales_checks_vendor_id_idx
  ON vendor_telesales_checks(vendor_id, checked_at DESC);

COMMENT ON TABLE vendor_telesales_checks IS
  'LC §1.4: 공정거래위원회 통신판매사업자 등록 조회 evidence. 면제 사유 기록 필수.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. vendor_contact_checks — LC §1 기준 5 (양방향 연락 가능성)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_contact_checks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  -- 'email' | 'phone'
  channel      TEXT NOT NULL CHECK (channel IN ('email', 'phone')),
  -- URL/path to stored evidence (email thread screenshot, call log, etc.)
  evidence_url TEXT,
  confirmed_at TIMESTAMPTZ,  -- NULL if not yet confirmed
  -- 90-day grace period start (for follow-up tracking)
  grace_period_start_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendor_contact_checks_vendor_id_idx
  ON vendor_contact_checks(vendor_id, confirmed_at DESC);

COMMENT ON TABLE vendor_contact_checks IS
  'LC §1.5: 양방향 연락 가능성 확인 evidence. confirmed_at NULL 이면 90일 보완 기간 대상.';

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS (Row Level Security) — internal-only; no public read needed
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vendor_brn_checks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_domain_checks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_telesales_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contact_checks  ENABLE ROW LEVEL SECURITY;

-- No public read policy — these tables are internal audit trails only.

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (run if migration needs to be reversed)
-- ─────────────────────────────────────────────────────────────────────────────
-- DROP TABLE IF EXISTS vendor_contact_checks;
-- DROP TABLE IF EXISTS vendor_telesales_checks;
-- DROP TABLE IF EXISTS vendor_domain_checks;
-- DROP TABLE IF EXISTS vendor_brn_checks;
-- ALTER TABLE companies DROP COLUMN IF EXISTS verification_revoked_reason;
-- ALTER TABLE companies DROP COLUMN IF EXISTS verification_revoked_at;
