# KOR-371 — companies.phone 처리 정책

**Status:** 보류 (defer). 외부 노출 금지.
**Last updated:** 2026-05-18 (PACAA-800 보드 결정 — 옵션 D)
**Policy basis:** PACAA-801 Legal Counsel advisory

## 결론

`companies.phone` 필드는 import 파이프라인에서 채우지 않는다. 기존 DB trigger `prevent_companies_phone_write` 는 유지.

벤더 본인이 자기등록 또는 명시적 동의를 거쳐 입력한 경우만 phone 노출이 허용될 수 있으며, 그 경로가 마련되기 전까지 import 파이프라인 (Naver Local 출처) 은 phone 을 저장하지 않는다.

## 배경

- `vendor_candidates.phone` 에는 Naver Local Search API 응답에서 받은 사업장 연락처가 1,175 건 보존되어 있음 (2026-05-18 기준).
- `companies.phone` 은 전체 NULL.
- `scripts/import_pipeline.py` 가 row dict 에서 phone 을 의도적으로 제외하고 있으며, 그 근거가 본 문서.

## Legal Counsel 자문 요약 (PACAA-801, 2026-05-17)

**위험도 — 중간 (조건부 승인).** 다음 5 조건 모두 충족 시에만 사업장 유선 prefix (02/031/032/051/053/062/064) 와 050 안심번호 에 한해 backfill 가능. 010/011/016~019 모바일은 별도 동의 없이 금지.

1. **Naver Local API 약관 확인 (선결)** — 재게시·디렉토리 구축 허용 여부 명문 확인. 미확인 상태 실행 금지. 통상 약관은 (i) 영구 저장 제한, (ii) 경쟁 디렉토리 구축 금지, (iii) 재배포 제한 조항을 포함할 수 있음.
2. **prefix 화이트리스트** — 010/011/016~019 mobile 전량 제외.
3. **개인정보 처리방침 update** — "공개된 사업자 연락처 수집" 항목 추가, 처리 근거 (PIPA §15 ①7호 공개정보 합리적 관련성) 명시, 거부 채널 안내.
4. **opt-out 채널** — 벤더 카드 하단 "내 정보 삭제 요청" 링크, 24~72 시간 내 처리 SOP.
5. **Migration audit log** — vendor_candidate ID / prefix 적용 결과 보존 (사후 분쟁 / 삭제요청 대응).

## 적용 법령

- PIPA §15 (수집·이용), §17 (제3자 제공), §15 ①7호 (공개정보 처리 — 합리적 관련성)
- PIPA §30 (처리방침 의무 기재사항)
- PIPA §39-3 (정보주체 권리 — 삭제 요청)
- PIPA §58-2 (법인 정보 vs 개인정보 구분)
- 표시광고법 §3 (사업자 연락처 진위 / 오인 가능성)
- Naver Open API 이용약관 (원문 확인 미완)

## 보드 결정 (2026-05-18, PACAA-800)

옵션 D — 보류 + 정책 명문화. 1,175 건 vendor phone 신호 포기.

대안 옵션 C+ (5 조건 compliance 후 backfill) 는 1~2 sprint 분량 + 처리방침 update + opt-out 채널 launch (one-way door) 가 필요하여 현 시점에서는 채택하지 않음. 우선순위 재평가 시점에 재검토.

## 재검토 트리거

다음 중 하나 발생 시 본 정책 재검토 + 새 LC 자문 routing 의무:

- Naver Open API 약관이 명시적으로 재게시 허용으로 개정됨
- 벤더 자기등록 경로 (phone 직접 입력 + 동의) 가 launch 되어 동의 기반 데이터 source 가 확보됨
- Packlinx 의 사업 모델 변경으로 vendor 연락처가 핵심 가치 lever 가 됨
- 보드가 명시적으로 phone backfill 재검토를 지시

## 참조

- PACAA-800 — 데이터 품질 phone backfill 검토 (보드 결정 issue)
- PACAA-801 — Legal Counsel 자문 (advisory 원문)
- PACAA-650 — import_pipeline.py 도입 당시 KOR-371 trigger 발견 기록
- DB trigger: `prevent_companies_phone_write` (companies 테이블)

## 자문 한계 명시 (LC 자문 verbatim)

이 정책의 법적 근거는 PACAA-801 Legal Counsel 자문에 의존한다.
이 자문은 참고용이며 법적 책임 면제를 보장하지 않는다.
사고 발생 시 면책 사유로 사용될 수 없으며, Packlinx 보드는
외부 변호사 자문 미도입을 결정한 상태이다. 모든 법적 리스크는
Legal Counsel 자문에 의존한다.
