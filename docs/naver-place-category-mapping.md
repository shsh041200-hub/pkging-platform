# Naver Place 업종코드 → Packlinx categories 매핑표

> Legal P1-D (PACAA-650): import pipeline에 사용되는 매핑 규칙의 코드/문서 명문화.
> 이 파일은 `scripts/import_pipeline.py`의 CATEGORY_MAP 상수와 동기화되어야 한다.

## 매핑 규칙 개요

`vendor_candidates` 테이블의 `category_id`는 `packaging_categories` 테이블을 외래키로
참조한다. Import pipeline은 `packaging_categories.category_key` 값을 `companies.category`
(PostgreSQL enum `category_type`)에 1:1 매핑한다.

## 매핑표 (packaging_categories.category_key → companies.category)

| packaging_categories.category_key | companies.category (enum) | 한국어 명칭 | 비고 |
|---|---|---|---|
| `corrugated_box` | **import 제외** | 골판지 박스 | 기존 `paper` category 와 중복; 별도 마이그레이션 필요 |
| `flexible_packaging` | `flexible_packaging` | 연포장재 | 기존 `flexible`과 구분 — 새 enum 값 |
| `plastic_container` | `plastic_container` | 플라스틱 용기 | 기존 `plastic`과 구분 — 새 enum 값 |
| `glass_metal_container` | `glass_metal_container` | 유리·금속 용기 | 기존 `glass`·`metal`과 구분 — 새 enum 값 |
| `label_sticker` | `label_sticker` | 라벨·스티커 | 신규 — 새 enum 값 |
| `printing_postprocess` | `printing_postprocess` | 인쇄·후가공 | 신규 — 새 enum 값 |
| `packaging_accessories` | `packaging_accessories` | 포장 부자재 | 신규 — 새 enum 값 |
| `packaging_machinery` | `packaging_machinery` | 포장 기계 | 신규 — 새 enum 값 |

### corrugated_box 제외 이유

기존 `companies` 데이터에 `category='paper'`로 등록된 업체가 corrugated_box와 실질적으로
동일 업종이다. Import pipeline에서 corrugated_box를 포함하면 `paper` ↔ `corrugated_box`
이중 카테고리 혼재 문제가 발생한다. 통합 마이그레이션은 별도 이슈로 관리한다.

### 기존 레거시 category 값 (pipeline에서 신규 사용 안 함)

| 기존 값 | 신규 대응 값 | 상태 |
|---|---|---|
| `paper` | `corrugated_box` (미적용) | 레거시 유지 |
| `plastic` | `plastic_container` | 레거시 유지 (신규 데이터는 `plastic_container`) |
| `flexible` | `flexible_packaging` | 레거시 유지 (신규 데이터는 `flexible_packaging`) |
| `eco` | — | 레거시 유지 |
| `glass` | `glass_metal_container` | 레거시 유지 (신규 데이터는 `glass_metal_container`) |
| `metal` | `glass_metal_container` | 레거시 유지 |

## Naver Place 수집 키워드 → category_key 매핑

Naver Place 수집 시 검색 키워드별로 category가 결정된다. 키워드 목록은
`plans/naver_scraper.py`의 `CATEGORY_KEYWORDS` dict를 참조.

주요 키워드 예시:

| 검색 키워드 | category_key |
|---|---|
| "라벨 인쇄 제조", "스티커 제조업체" | `label_sticker` |
| "포장 인쇄 제조", "후가공 인쇄업체" | `printing_postprocess` |
| "완충재 제조업체", "에어캡 제조업체" | `packaging_accessories` |
| "연포장 제조업체", "포장 필름 제조업체" | `flexible_packaging` |
| "유리병 제조업체", "금속 캔 제조업체" | `glass_metal_container` |
| "포장기계 제조업체", "자동 포장 설비" | `packaging_machinery` |
| "플라스틱 용기 제조", "PET 용기 제조" | `plastic_container` |

## Import 필드 제한 (Legal P0-B)

import pipeline은 다음 4개 필드만 `companies` 테이블에 기록한다:

| vendor_candidates 컬럼 | companies 컬럼 | 비고 |
|---|---|---|
| `business_name` | `name` | 업체명 |
| `phone` | `phone` | 전화번호 |
| `address_raw` | `address` | 주소 원문 |
| category_key (via packaging_categories join) | `category` | 카테고리 |

**DROP 항목** (Legal P0-B — 수집했지만 companies에 적재 금지):
- `source_url` (Naver 링크)
- `source_id` (Naver ID)
- `address_city`, `address_district` (별도 파싱 주소 — `address_raw`만 허용)
- 이메일, SNS 메타, 영업시간, 기타 부수정보 (수집된 경우에도 drop)

## 자동 설정값

| companies 컬럼 | 값 | 이유 |
|---|---|---|
| `is_verified` | `false` | Legal P1-E: 5기준 통과 시만 manual flip |
| `is_hidden` | `false` | 기본 공개 |
| `data_source` | `'naver_place'` | 출처 명기 (감사 추적) |
| `candidate_source_id` | 해당 vendor_candidates.id | 중복 방지 + 역추적 |

## 변경 이력

| 날짜 | 변경 내용 | 이슈 |
|---|---|---|
| 2026-05-13 | 최초 작성 (7개 카테고리 매핑) | PACAA-650 |
