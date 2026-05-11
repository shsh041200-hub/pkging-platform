---
title: Vendor 운영 owner SOP — `is_verified` 부여·갱신·박탈 일상 절차
owner: CEO (Packlinx 대표)
legal_reviewer: Legal Counsel
companion_doc: docs/legal/vendor-verification-criteria.md
applicable_law:
  - 표시광고법 §3 (3) 기만적 표시광고 금지
  - 표시광고법 §4 (1) 실증의 의무
  - 전자상거래법 §13 (통신판매업자 신원정보)
  - PIPA §15 (수집·이용 근거)
revision: r1
status: 시행 (보드 승인 2026-05-11, PACAA-507)
---

# Vendor 운영 owner SOP

본 문서는 `vendor-verification-criteria.md` (이하 "criteria") 의 §1~3 을
일상 운영으로 옮기는 절차를 정의한다. 운영 owner = CEO (Packlinx 대표,
PACAA-507 보드 결정 2026-05-11) 단일 책임자.

solo-operated 단계의 현실 제약을 반영해 도구 / 트리거 / 보존 위치 /
SLA 를 명문화한다. vendor 수가 단일 운영자 처리 한계를 초과하는 시점에
별도 운영 인력 채용 가능성을 재검토 (재검토 트리거: 신규 등록 신청
주당 평균 ≥ 10건, 또는 박탈 결정 월 ≥ 5건 중 어느 하나).

## 1. 신규 vendor 등록 시 절차 (criteria §1 5종 기준)

### 1-A. 도구 / 데이터 위치

- **vendor 등록 입력 채널:** Packlinx admin dashboard 의 vendor 신청
  큐 (현재 — 향후 self-serve 폼 추가 시 본 SOP 갱신).
- **검증 기록 저장:** `vendors` 테이블 + `vendor_evidence` 보조 테이블
  (criteria §5-A 의 evidence 컬럼 — 5종 항목별 last_checked_at +
  raw_payload). 현재는 supabase 직접 조회·기록.
- **raw payload 보존:** DB JSONB 컬럼으로 시작. evidence 양이 행당
  100KB 초과로 누적되는 시점 (PACAA-511 audit 결과 평가) 에서 object
  store (S3 호환) 로 이전 검토.

### 1-B. 검증 단계 (수동 + 자동 혼합)

| # | 항목 | 도구 | 운영 owner 액션 |
|---|------|------|----------------|
| 1 | BRN 유효성 | 홈택스 사업자상태 조회 (수동 페이지 조회, 향후 API 연동) | 응답 화면 capture (PNG/PDF) + 파싱한 status 텍스트 evidence 기록 |
| 2 | 명의 일치 | 1번 응답의 상호 vs vendor 입력 상호 정규화 비교 | 정규화 룰 = 공백 제거·법인 약어 통일·대소문자 통일. 일치 판정 결과 evidence 기록 |
| 3 | 도메인 실재성 | `curl -I` 또는 브라우저 + `whois` (마스킹된 경우 본 항목 가점 0) | HTTP status, redirect chain, WHOIS 발췌 (개인정보 마스킹 후) evidence 기록 |
| 4 | 통신판매업 신고 | 공정거래위원회 통신판매사업자 조회 페이지 (수동) | 조회 결과 capture 또는 면제 사유 텍스트 (제조업 등) evidence 기록 |
| 5 | 양방향 연락 확인 | 등록 메일로 1회 회신 요청 + 회신 수신 OR 등록 전화로 통화 1회 | 수신 메일 헤더·발췌 OR 통화 일시·요약 evidence 기록. 자동응답·발신차단은 fail |

5종 모두 PASS → admin dashboard 에서 `is_verified = true` 설정.
하나라도 fail → `is_verified = false` 유지 + 사유 vendor 통지 (§5).

### 1-C. SLA — 신청 접수 후 14 영업일 이내 판정

- 5종 검증 각 항목 별 SLA 합산 가정: BRN/명의/도메인 ≤ 1일, 통신판매업
  조회 ≤ 1일, 양방향 연락 확인 ≤ 5~10일 (vendor 응답 대기 포함).
- 14일 초과 시 신청자에게 진행 상황 통지 + 보류 사유 명시.

## 2. 정기 갱신 (12개월) — Paperclip routine

### 2-A. 분기별 due 점검 routine

- **routine name:** `Vendor verification quarterly renewal sweep`
- **schedule:** 분기 1회 (매 분기 1일 09:00 KST). cron `0 0 0 1 1,4,7,10 *` (UTC 기준 분기초).
- **owner agent:** CEO (e33ecade-45dc-47ea-9d46-78ef72e8831c).
- **trigger action:** routine fire 시 child issue 자동 발의 → "다음
  90일 내 12개월 만료 도래 vendor 목록 조회 + 1·2번 항목 (BRN/명의)
  재조회".
- **trigger 등록 의무:** routine + trigger 둘 다 POST 후 nextRunAt
  cross-check (memory `feedback_routine_trigger_required.md`).

### 2-B. 갱신 실패 처리

재조회에서 "휴업자/폐업자/말소" 응답 시 즉시 §3 박탈 절차 진입
(criteria §3 - 1).

## 3. 이벤트 트리거 갱신 (정기 외 즉시 재검증)

| 트리거 | 모니터링 source | 응답 SLA |
|-------|---------------|---------|
| vendor 의 상호/사업자번호 self-update | admin dashboard 의 vendor profile 변경 audit log (구현 필요 — Backend ticket 별도) | 변경 후 5 영업일 이내 §1 1·2번 재검증 |
| 사이트 도메인 변경 | 동일 (profile 변경 audit log) | 변경 후 5 영업일 이내 §1 3번 재검증 |
| 통신판매업 신고 정보 변경 신호 | 공정위 사이트 분기별 sweep 시 자동 cross-check (분기 routine 에 포함) | sweep fire 시 즉시 재검증 |
| 사용자 신고 누적 ≥ 3건 | "vendor 정보 부정확" 신고 채널 (구현 필요 — Backend ticket 별도) | 누적 3건 도달 즉시 운영 owner 알림 + 7 영업일 이내 §1 전 항목 재검증 |

**구현 의존성:** profile 변경 audit log + 사용자 신고 카운터는 Backend
ticket 으로 별도 발의 (PACAA-511 audit 작업과 묶을 수 있는지 검토). 그
전까지는 vendor 의 self-update 후 수동 모니터링 + Telegram 신고 채널.

## 4. 박탈 결정 7종 (criteria §3) — 권한 분기

| # | 박탈 사유 | 단독 결정 권한 | LC 사전 검토 필요 |
|---|---------|--------------|-----------------|
| 1 | BRN "휴업자/폐업자/말소" 전환 | CEO 단독 | 불필요 (객관적 fact) |
| 2 | 도메인 미응답 14일 이상 | CEO 단독 | 불필요 |
| 3 | 90일 내 양방향 연락 재확인 실패 | CEO 단독 | 불필요 |
| 4 | 통신판매업 신고 직권 말소 / 미신고 발견 | CEO 단독 | 불필요 |
| 5 | vendor 본인 박탈 요청 | CEO 단독 | 불필요 |
| 6 | 사실 조사 결과 §1 1~5 사후 미충족 | CEO 단독 | **권장** (조사 결론의 fact-finding 가 분쟁 가능) |
| 7 | 공정위 시정조치·과징금·고발 처분 공시 | CEO 단독이지만 LC 검토 후 진행 | **필수** (Packlinx 가 라벨 유지 시 §3(3) 위반 방조 위험 — 공시 fact 와 영향 범위 LC 자문 의무) |

**LC 검토 절차:** 박탈 결정 의결 전 PACAA Legal Counsel agent 에 자문
ticket 발의 → LC 의견 회신 (24h 이내) → CEO 최종 의결.

## 5. vendor 통지 (criteria §3 의 통지 의무)

- **통지 채널:** 등록 대표 메일. 메일 미수신 시 admin dashboard 의
  vendor 알림 영역 (구현 필요 시점에 Backend 협업).
- **통지 시점:** 박탈 즉시 (24h 이내). 정기 갱신 due 30일 전 사전
  reminder 별도 발송 (renewal 협조 요청).
- **통지 내용:** 박탈 사유 (criteria §3 의 어느 항목인지 명시) + 재신청
  절차 + 이의제기 채널 (운영 owner 메일).
- **메일 템플릿 / 대시보드 표시:** PACAA-512 (CMO surface) 와 협업으로
  카피 정형화. 본 SOP 는 통지 의무·시점·필수 내용 만 정의.

## 6. evidence 보존 (3년)

- **저장소:** 1차 — supabase DB 직접 조회 (vendor_evidence 테이블). raw
  payload 행당 누적 100KB 초과 시 object store 이전 검토 (PACAA-511
  audit 결과 평가 후 결정).
- **백업 정책:** supabase 자동 일일 백업 + 주 1회 export 백업 (추후
  Backend 별도 ticket — 현재 파이프라인 미보유는 SOP r1 의 known gap).
- **접근 통제:** 운영 owner (CEO) + Backend Engineer 만 read 권한.
  vendor 본인 evidence 본인 열람 요청은 PIPA §35 정보주체 권리 절차로
  대응 (별도 SOP 필요 시 v2 에서 추가).
- **보존 기간:** 부여 시점부터 박탈 후 3년. 박탈 후에도 표시광고법
  §4(1) 사후 입증 부담 대비.

## 7. 공정위 자료 요구 15일 SLA

표시광고법·전자상거래법 위반 조사 시 공정위가 자료 제출 요구할 경우의
대응 절차.

- **수령 채널:** 사업자등록 주소 등기우편 + 운영 owner (CEO) 메일.
- **수령 즉시:** PACAA Legal Counsel 자문 ticket 발의 (priority high) +
  Backend Engineer 에 evidence 추출 ticket 발의.
- **15일 SLA 분해:**
  - D+0~2: LC 자문 의견 + 자료 범위 확정.
  - D+2~10: Backend evidence 추출 + LC 검토.
  - D+10~14: 답변서 작성 (LC 주도).
  - D+14: 공정위 제출 (등기우편 또는 지정 채널).
- **escalation paths:** 15일 SLA 임박 (D+10 까지 evidence 미준비) 시
  보드 즉시 escalation. 외부 변호사 자문 도입 의사결정 (현재 미도입)
  재검토 트리거.
- **원칙:** 자료 미제출은 표시광고를 허위·기만적인 것으로 추정시키는
  강력한 정황이 됨 (criteria §1 본문). 절대 deadline 누락 금지.

## 8. 본 SOP 자체 갱신

- **갱신 트리거:**
  - criteria §1~3 항목 변경 시 (LC 검토 후).
  - 새 도구 도입 (예: BRN API 연동, profile audit log 구현) 시 §1·§3
    표 갱신.
  - vendor 수 임계 (재검토 트리거) 도달 시.
  - 분기 routine 결과 회고 (이상 패턴 발견 시).
- **개정 절차:** revision 번호 +1 (r1 → r2) + 보드 승인 + LC 사전 검토.
- **revision history:**
  - r1 (2026-05-11): 최초 시행. PACAA-507 보드 결정 (운영 owner = CEO)
    + PACAA-517 SOP 신설.

---

⚠️ 본 SOP 는 운영 절차 명문화 문서이며, 법적 책임 면제를 보장하지 않습니다.
사고 발생 시 면책 사유로 사용될 수 없습니다. Packlinx 보드는 외부 변호사
자문 미도입을 결정한 상태이며, 모든 법적 리스크는 Legal Counsel 자문에
의존합니다.
