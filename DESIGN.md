# Packlinx Design System

**V03 로고 기반 · 2026-04-24 · KOR-434/KOR-436**

이 문서는 packlinx.com의 공식 디자인 시스템입니다. 모든 UI 작업은 이 문서의 색상 토큰과 사용 규칙을 따릅니다. 이 문서는 `COMPANY_PRINCIPLES.md` "Brand Color System" 섹션과 동기화되어 있으며, 충돌 시 `COMPANY_PRINCIPLES.md`가 우선합니다.

---

## 브랜드 포지셔닝

프리미엄 B2B 플랫폼. 전문 구매 담당자에게 신뢰감을 주는 디자인. Linear / Notion / Vercel 수준의 절제된 미감. 소비자용 시각 소음 금지.

---

## 색상 시스템

### 브랜드 색상 (유채색 단 하나)

LINX 오렌지 — V03 로고에서 추출. 브랜드의 유일한 유채색.

| 토큰 | HEX | Tailwind | 용도 |
|------|-----|----------|------|
| `brand-50` | `#FFF7ED` | orange-50 | 틴트 배경, 호버 |
| `brand-100` | `#FFEDD5` | orange-100 | 배지 배경 |
| `brand-200` | `#FED7AA` | orange-200 | 포커스 링, 보더 |
| `brand-300` | `#FDBA74` | orange-300 | — |
| `brand-400` | `#FB923C` | orange-400 | 호버 아이콘 |
| **`brand-500`** | **`#F97316`** | **orange-500** | **로고 색상. 아이콘, 장식, 다크 배경 위 텍스트** |
| `brand-600` | `#EA580C` | orange-600 | 호버 (대형 텍스트 AA 통과) |
| **`brand-700`** | **`#C2410C`** | **orange-700** | **CTA 버튼 배경, 라이트 배경 위 오렌지 텍스트 (AA 5.18:1 ✅)** |
| `brand-800` | `#9A3412` | orange-800 | CTA 버튼 호버 배경 |
| `brand-900` | `#7C2D12` | orange-900 | 고대비 텍스트 |

**핵심 규칙:**
- **CTA 버튼**: `brand-700` (`#C2410C`) 배경 + 흰색 텍스트, 호버 시 `brand-800`
- **아이콘/장식**: `brand-500` (`#F97316`) — 텍스트가 아닌 시각 요소
- **라이트 배경 텍스트**: 반드시 `brand-700` 이상 (brand-500 텍스트 금지 — 2.80:1 AA 실패)
- **다크 배경 텍스트**: `brand-500` 허용 (on `#0F172A`: 6.37:1 ✅)
- **본문에 오렌지 금지**: 오렌지는 CTA, 강조, 아이콘 전용

### 뉴트럴 색상 (PACK 슬레이트)

V03 로고 PACK 텍스트의 `#0F172A` / `#F8FAFC` 에서 도출. 전체 slate 스케일 채택.

| 토큰 | HEX | Tailwind | 용도 |
|------|-----|----------|------|
| **`neutral-50`** | **`#F8FAFC`** | **slate-50** | **로고 라이트 텍스트. 서브틀 배경** |
| `neutral-100` | `#F1F5F9` | slate-100 | 서브틀 배경, muted |
| `neutral-200` | `#E2E8F0` | slate-200 | 기본 보더 |
| `neutral-300` | `#CBD5E1` | slate-300 | 강조 보더, placeholder |
| **`neutral-400`** | **`#94A3B8`** | **slate-400** | **장식용 텍스트만 (AA 미달 — 텍스트 사용 금지)** |
| `neutral-500` | `#64748B` | slate-500 | 보조 텍스트 (AA 4.76:1 ✅) |
| `neutral-600` | `#475569` | slate-600 | 보조 텍스트, 태그라인 |
| `neutral-700` | `#334155` | slate-700 | 라벨, 부제목 |
| `neutral-800` | `#1E293B` | slate-800 | 강조 텍스트 |
| **`neutral-900`** | **`#0F172A`** | **slate-900** | **로고 다크 텍스트. 본문, 헤더 배경** |
| `neutral-950` | `#020617` | slate-950 | 최고 다크 |

**핵심 규칙:**
- **본문 텍스트**: `neutral-900` on white
- **보조 텍스트**: `neutral-500` 이상 (neutral-400은 장식/placeholder만)
- **헤더/다크 배경**: `neutral-900` (`#0F172A`) — 로고와 동일한 값

### 시맨틱 색상 (기능색 — 브랜드색 아님)

#### Success (성공/인증)
| 토큰 | HEX | 용도 |
|------|-----|------|
| `success-50` | `#F0FDF4` | 성공 배경 |
| `success-200` | `#BBF7D0` | 성공 보더 |
| `success-700` | `#15803D` | 인증 배지 텍스트 (on success-50: 4.79:1 ✅) |

#### Error (오류/삭제)
| 토큰 | HEX | 용도 |
|------|-----|------|
| `error-50` | `#FEF2F2` | 오류 배경 |
| `error-600` | `#DC2626` | 오류 텍스트, 파괴적 버튼 |
| `error-700` | `#B91C1C` | 오류 배지 텍스트 (on error-50: 5.91:1 ✅) |

#### Warning (경고)
| 토큰 | HEX | 용도 |
|------|-----|------|
| `warning-50` | `#FFFBEB` | 경고 배경 |
| `warning-700` | `#B45309` | 경고 텍스트, 아이콘 |

#### Info (정보/링크) — 기능색. 레거시 `#005EFF` 블루의 계승자
| 토큰 | HEX | 용도 |
|------|-----|------|
| `info-50` | `#EFF6FF` | 정보 배지 배경, 선택 필터 배경 |
| `info-200` | `#BFDBFE` | 정보 보더 |
| `info-600` | `#2563EB` | 링크 텍스트, 정보 텍스트 (on white: 5.17:1 ✅) |
| `info-700` | `#1D4ED8` | 링크 hover |

> **Note:** `info-600` (`#2563EB`)은 레거시 `#005EFF` 블루 기반 링크/정보 affordance를 대체. 브랜드 액센트가 아닌 순수 기능색. 텍스트 링크, 선택 필터 칩, 정보 배지에만 사용.

---

## CSS 변수 (globals.css 정의됨)

```css
/* Brand */
--color-brand:         #C2410C;  /* CTA 버튼 기본 */
--color-brand-hover:   #9A3412;  /* CTA 버튼 호버 */
--color-brand-light:   #FFF7ED;  /* 틴트 배경 */

/* Neutral */
--color-navy:          #0F172A;  /* 헤더, 다크 배경 */
--color-navy-800:      #1E293B;

/* Text */
--color-text-primary:   #0F172A;
--color-text-secondary: #64748B;
--color-text-muted:     #94A3B8;  /* 장식용만 */

/* Info */
--color-info:       #2563EB;  /* 링크, 정보 요소 */
--color-info-hover: #1D4ED8;
--color-info-light: #EFF6FF;
```

---

## 타이포그래피

- **폰트**: Pretendard (한국어 최적화), fallback: -apple-system, BlinkMacSystemFont
- **Body**: 16px, `letter-spacing: -0.01em`
- **Heading (H1–H3)**: `letter-spacing: -0.025em`
- **Line-height**: 본문 1.6, 헤딩 1.15–1.3

---

## 접근성 WCAG AA 필수 조합

| 조합 | 대비비 | 판정 |
|------|--------|------|
| `#0F172A` on `#FFFFFF` | 17.85:1 | ✅ 본문 기본 |
| `#64748B` on `#FFFFFF` | 4.76:1 | ✅ 보조 텍스트 최소값 |
| `#C2410C` on `#FFFFFF` | 5.18:1 | ✅ CTA 텍스트/버튼 |
| `#FFFFFF` on `#C2410C` | 5.18:1 | ✅ CTA 버튼 흰 텍스트 |
| `#F97316` on `#FFFFFF` | 2.80:1 | ❌ 텍스트 금지 |
| `#F97316` on `#0F172A` | 6.37:1 | ✅ 다크 배경 오렌지 허용 |
| `#2563EB` on `#FFFFFF` | 5.17:1 | ✅ 링크 텍스트 |
| `#94A3B8` on `#FFFFFF` | 2.56:1 | ❌ 장식용만 |

---

## 기존 DESIGN.md (KOR-96) 대비 변경사항

| 항목 | 이전 (KOR-96) | 현재 (KOR-434/436) |
|------|--------------|-------------------|
| Primary accent | `#005EFF` (vivid blue) | `#F97316` / `#C2410C` (brand orange) |
| Neutral base | gray 스케일 (임의) | slate 스케일 (로고 기반) |
| Header dark | `#0A0F1E` | `#0F172A` (로고 정확값) |
| CTA button | `#005EFF` → `#0047CC` | `#C2410C` → `#9A3412` |
| 링크 텍스트 | `#005EFF` | `#2563EB` (info-600, 기능색) |
| 배지 배경 | `#EBF2FF` | `#EFF6FF` (info-50) |
| 브랜드 배지 | — | `#C2410C` text + `#FFF7ED` bg |
| Glow shadows | `rgba(0,94,255,...)` | `rgba(249,115,22,...)` |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-04-24 | Frontend Developer | 초기 작성 — KOR-436. KOR-434 브랜드 색상 시스템 반영. 레거시 KOR-96 블루 팔레트 교체. |
