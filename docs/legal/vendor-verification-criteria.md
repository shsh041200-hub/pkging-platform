---
title: Vendor "is_verified" 부여·갱신·박탈 기준 (Packlinx 자체 등록 절차)
owner: CEO (Packlinx 대표)
legal_reviewer: Legal Counsel
applicable_law:
  - 표시광고법 §3 (3) 기만적 표시광고 금지
  - 표시광고법 §4 (1) 실증의 의무
  - 전자상거래법 §13 (통신판매업자 신원정보)
  - PIPA §15 (수집·이용 근거)
revision: r1
status: 시행 (보드 승인 2026-05-11)
operations_sop: docs/legal/vendor-operations-sop.md
---

# Vendor `is_verified` 부여 기준 (Packlinx 자체 등록 절차)

## 0. 본 표시의 법적 성격 (필수 명시 문구)

> **본 표시(`리스트업 여부` / `정보 등록`)는 외부 공인 인증기관(예: KS, ISO, Korean Standards Association, 한국정보통신기술협회 등)이 발급한 인증이 아닙니다. Packlinx 가 자체적으로 운영하는 등록 절차에 따라, 아래 객관적·실증 가능한 기준을 만족한 업체에 한해 부여되는 표시입니다.**

이 문구는 다음 모든 surface 에 동일하게 노출되어야 한다 (§4 참조):
- FAQ
- 가이드 metaDescription / 페이지 본문
- vendor 카드 hover / tooltip
- 약관 부속서

근거: 표시광고법 §3 (3) — "사실과 다르거나 사실을 지나치게 부풀려 소비자를 속이거나 잘못 알게 할 우려가 있는 표시·광고" 금지. "검증됨" / "Verified" 라는 단어를 외부 공인 인증과 혼동될 수 있는 방식으로 단독 노출하는 것은 기만적 표시광고에 해당할 위험이 있음. 따라서 단어 자체를 회피하거나(§4-B 권고안), 부득이 사용 시 위 한정 문구 병기.

## 1. 부여 기준 (객관적·실증 가능)

다음 **모든 항목**을 충족할 때 `is_verified = true` 부여. 임의 판단 또는 "Packlinx 가 추천하는 업체" 같은 주관적 항목은 금지.

| # | 항목 | 검증 방법 | 보존해야 할 실증 자료 |
|---|------|---------|------------------|
| 1 | 사업자등록번호 (BRN) 유효성 | 국세청 사업자등록상태 조회 API ([홈택스 - 사업자 상태 조회](https://www.hometax.go.kr/)) 에서 "계속사업자" 상태 응답 | 조회 시점 timestamp + 응답 raw payload (최소 12개월) |
| 2 | 법인/사업자 명의 일치 | 국세청 조회 결과의 상호 = vendor 가 등록한 상호 (공백·법인 약어 정규화 후 일치) | 정규화 전·후 문자열, 일치 판정 룰 ID |
| 3 | 웹사이트 도메인 실재성 | HTTP 200/301/302 응답 + 도메인 등록자 정보(WHOIS)가 1번의 사업자와 동일 주체로 합리적으로 추정 가능 (※ WHOIS 가 마스킹된 경우 본 항목 가점 없음 → 별도 보완 절차 필요) | 응답 status, redirect chain, WHOIS 발췌 (개인정보 마스킹 후) |
| 4 | 통신판매업 신고 여부 (해당 시) | 공정거래위원회 통신판매사업자 조회 결과에 vendor 의 사업자번호가 존재할 것. (제조업 등 통신판매업 미해당 vendor 는 본 항목 면제 — 면제 사유 기록 필수) | 조회 결과 또는 면제 사유 텍스트 |
| 5 | 최소 1회 연락 가능성 확인 | 등록된 대표 이메일 또는 대표 전화로 양방향 확인(메일 회신 1회 또는 통화 응답 1회). 자동 응답·발신 차단 불가. | 확인 시점, 채널, 응답 evidence (PIPA §15 동의 범위 내 보존) |

운영 owner 는 위 1~5 의 실증 자료를 vendor 별로 보존해야 하며, 보존 기간은 최소 **부여 후 3년**으로 한다 (표시광고법 §4 (1) 실증 자료 제출 요구 대비). 표시광고법 사건의 사법·행정 조사 실무상 실증자료 미제출은 표시광고 자체를 허위·기만적인 것으로 추정시키는 강력한 정황이 되므로, 보존 누락은 사실상 면책 포기에 해당함.

## 2. 갱신 주기

- **정기 갱신:** 12개월 (연 1회). 1~2번 항목(사업자등록·명의 일치) 재조회 필수.
- **이벤트 트리거 갱신 (정기 외 즉시 재검증):**
  - vendor 의 상호/사업자번호 self-update
  - 사이트 도메인 변경
  - 통신판매업 신고 정보 변경 신호
  - 사용자 신고 (vendor 정보 부정확) 누적 3건 이상
- **재검증 실패 시:** `is_verified = false` 로 즉시 박탈하고 §3 박탈 사유 기록.

## 3. 박탈 사유 (revocation triggers)

다음 중 **어느 하나라도 해당하면** `is_verified` 를 false 로 전환한다.

1. 사업자등록 상태가 "휴업자" / "폐업자" / "말소" 로 전환
2. 도메인 미응답이 14일 이상 지속
3. 최근 90일 내 양방향 연락 가능성 재확인 실패 (이메일 bounce + 전화 미응답)
4. 통신판매업 신고가 직권 말소되거나, 신고 의무 대상임에도 신고 없음이 발견된 경우
5. vendor 본인의 박탈 요청
6. 사용자/타 vendor 의 신고에 기반한 사실 조사 결과, 부여 기준 1~5 중 어느 하나가 사후적으로 충족되지 않은 것으로 확인된 경우
7. 표시광고법·전자상거래법 위반으로 공정거래위원회 시정조치·과징금·고발 처분을 받은 사실이 공시된 경우 (Packlinx 가 그 표시를 유지하면 §3(3) 위반 방조 위험)

박탈은 운영 owner 의 단독 권한이며, vendor 에게 박탈 사유와 재신청 절차를 통지한다(전자상거래법상 거래상대방 정보 변경 통지 의무에 준함).

## 4. FAQ / 약관 surface 권고

### 4-A. 노출 위치 (모든 surface 에 동일 문구 — §0 의 한정 문구 — 노출 권고)

| Surface | 노출 형태 | 우선순위 |
|---------|---------|--------|
| FAQ ("`리스트업/정보 등록`은 무엇인가요?") | 전체 본문 + §1~3 요약 + §0 한정 문구 | **필수 (P0)** |
| 약관 부속서 (별표) | §0~3 전문 링크 | **필수 (P0)** |
| Footer | "Packlinx 자체 등록 기준 안내" 링크 → FAQ 항목 | 권장 (P1) |
| Vendor 카드 hover / `?` 아이콘 tooltip | §0 한정 문구 1줄 + FAQ 링크 | **필수 (P0)** |
| 가이드 / SEO 페이지 metaDescription | "검증된 업체" 표현 제거 (PACAA-507 잔여 surface 후속 처리 필요) | **필수 (P0)** |

### 4-B. 카피 톤 — 두 가지 안 비교

| 안 | 라벨 카피 | 법적 리스크 등급 | 권고 |
|---|-----------|--------------|-----|
| **A. 단어 회피 (rebrand)** | "리스트업 여부", "정보 등록", "등록 업체" — "인증"·"검증" 어휘 제거 | **낮음 (낮음/중간/높음/금지 중 낮음)** | **권고 (recommended)** |
| **B. 기준 + 표시 병기** | "검증 (Packlinx 자체 등록 기준)" + §0 한정 문구 hover | **중간** — 단어 자체가 외부 공인 인증과 혼동될 여지가 잔존. 한정 문구가 vendor 카드 hover 외 다른 노출 경로에서 누락될 경우 즉시 §3(3) 위험으로 전환 | 비권고 |

**Legal Counsel 의견:** 안 A 우선 채택. 안 B 는 한정 문구 누락 시 면책 자료가 사라지므로 운영 risk 가 크다. 안 A 가 §3(3) 잔여 위험을 가장 낮춤.

### 4-C. PACAA-508 (FE) 라벨 변경안 검토

- **`'인증 여부'` → `'리스트업 여부'` 또는 `'정보 등록'`** : **승인 (안 A 와 정합)**.
  - 추가 의견: 둘 중 **`'정보 등록'`** 을 선호. "리스트업" 은 영문 외래어로 일반 이용자에게 의미 전달이 약하고, "등록" 은 §0 의 "자체 등록 절차" 와 일관된다.
  - 단, **컬럼명 자체** (`is_verified`) 는 DB schema 안에서는 유지해도 무방하나, 향후 마이그레이션 시 `is_listed` 같은 중립 명으로 rename 권고(§5 참조). 표시광고법 risk 는 사용자가 보는 라벨에서만 발생.
- `'verified'` true/false 값 자체의 의미는 §1 의 기준을 만족했는지의 단일 정의로 고정해야 한다. 라벨만 바꾸고 부여 기준이 임의이면 §3(3) 위험은 해소되지 않는다 — 즉 PACAA-508 (라벨) 과 본 작업(기준 명문화) 은 **반드시 함께 배포**되어야 한다.

### 4-D. 동의·고지

PIPA §15 관점: 본 절차에서 수집·검증되는 vendor 정보(BRN, 도메인 소유자, 연락처)는 vendor 본인이 사업자로서 등록 시 제공한 것이므로 별도 정보주체 동의 없이 처리 가능하나, 위 §1 5번 양방향 연락 확인 시점에서 그 목적(=등록 절차 검증)을 명시한 고지가 vendor 측 회신/통화 안내에 포함되어야 한다.

## 5. DB migration / Backend audit 후속 작업 가이드

본 작업 완료 직후, Backend Engineer 에게 별도 child 로 발의할 audit 작업을 위한 판정 권고:

### 5-A. 현재 `is_verified=true` 행 전수 점검 SQL (개념)

```sql
-- 현재 true 인 모든 vendor 행에 대해, §1 의 5개 기준 각각의 evidence 컬럼/테이블을 LEFT JOIN
-- 단 하나라도 evidence 가 NULL 이거나 stale (>12개월) 이면 audit_status='fail_to_meet_criteria' 로 마킹.
SELECT v.id, v.brn, v.name,
       (brn_check.checked_at IS NULL OR brn_check.checked_at < NOW() - INTERVAL '12 months') AS brn_missing_or_stale,
       (domain_check.last_ok_at IS NULL OR domain_check.last_ok_at < NOW() - INTERVAL '12 months') AS domain_missing_or_stale,
       (contact_check.confirmed_at IS NULL) AS contact_missing,
       ...
FROM vendors v
LEFT JOIN vendor_brn_checks brn_check ON ...
LEFT JOIN vendor_domain_checks domain_check ON ...
LEFT JOIN vendor_contact_checks contact_check ON ...
WHERE v.is_verified = true;
```

### 5-B. 판정 룰 (어떤 행을 false 로 돌릴지)

| 조건 | 조치 |
|------|-----|
| §1 의 evidence 가 단 하나라도 없거나 12개월 초과 stale | `is_verified = false` 로 전환 + `verification_revoked_reason = 'audit_2026Q2_evidence_missing'` 기록 |
| evidence 가 충분 (1~5 모두 ≤12개월) | 유지 |
| BRN 휴/폐업 상태 응답 | 즉시 false + `revoked_reason = 'brn_inactive'` |
| 5번 양방향 연락 확인 자료 없음 | 90일 보완 기간 후 미보완 시 false (즉시 false 가 아니라 단계적 대응 가능) |

### 5-C. 마이그레이션 시 동시 권고

- 박탈 시 vendor 에게 사유 + 재신청 절차 통지 (메일/대시보드).
- audit 시점의 raw evidence snapshot (§1 5컬럼) 을 vendor 별로 영구 저장.
- 컬럼 rename (`is_verified` → `is_listed`) 은 본 audit 와 별도 PR 로 분리 권고 (이름 변경과 의미 변경을 같은 PR 에서 섞으면 rollback 위험).

## 6. 책임자 (Operations Owner)

- **운영 owner: CEO (Packlinx 대표).** 본 문서 §1~3 의 운용·증빙 보존·박탈 결정의 단일 책임자. 보드 결정 (PACAA-507, 2026-05-11): solo-operated 단계에서는 운영 owner 와 의사결정 owner 를 분리할 잉여 자원이 없으므로 CEO 가 단일 책임자. 별도 운영 인력 채용은 vendor 수가 단일 운영자 처리 한계를 초과하는 시점에 재검토.
- **법률 자문:** Legal Counsel — 본 문서 개정 시 사전 검토. 박탈 결정 중 §3-7 (공시 처분 기반 박탈) 은 LC 사전 검토 필수.
- **기술 owner:** Backend Engineer — §5 의 audit 및 evidence schema 유지.
- **운영 SOP:** `docs/legal/vendor-operations-sop.md` — §1~5 의 일상 운영 절차 (신규 등록 / 정기 갱신 / 이벤트 트리거 / 박탈 / 통지 / evidence 보존 / 공정위 자료 요구 SLA) 명문화.

---

⚠️ 자문 한계 명시:
이 자문은 참고용이며 법적 책임 면제를 보장하지 않습니다.
사고 발생 시 면책 사유로 사용될 수 없습니다. Packlinx 보드는
외부 변호사 자문 미도입을 결정한 상태이며, 모든 법적 리스크는
Legal Counsel 자문에 의존합니다.
---
