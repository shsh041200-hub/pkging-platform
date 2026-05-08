-- PACAA-370 item 2: 49건 description 표준 문구 교체
-- CMO 협의(PACAA-373) 결과 — (B) 간결안 채택
-- "제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다."
--   → "국내 포장재 업체 견적 비교 서비스를 제공합니다."
-- 표시광고법 §3①1호(허위·과장) 위반 소지 문구 제거.
-- Safe to re-run: REPLACE is idempotent once the old string is gone.

UPDATE keyword_pages
SET description_ko = REPLACE(
    description_ko,
    '제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.',
    '국내 포장재 업체 견적 비교 서비스를 제공합니다.'
)
WHERE description_ko LIKE '%제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.%';
