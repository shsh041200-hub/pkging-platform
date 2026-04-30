<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 디자인 시스템 (필수 — 모든 UI 작업 적용)

**[`DESIGN.md`](./DESIGN.md)는 packlinx.com의 공식 디자인 시스템이다.** 모든 프론트엔드 작업 전에 반드시 읽어야 한다.

핵심 규칙 요약 (전체 규칙은 반드시 DESIGN.md 참조):

- **CTA 버튼**: `#C2410C` (brand-700) 배경 + 흰색 텍스트. 호버 시 `#9A3412`
- **아이콘/장식**: `#F97316` (brand-500) — 텍스트에는 사용 금지
- **라이트 배경 텍스트**: brand-700 이상만 허용 (brand-500은 AA 실패)
- **본문 텍스트**: `#0F172A` (neutral-900)
- **보조 텍스트**: `#64748B` (neutral-500) 이상
- **링크**: `#2563EB` (info-600) — 브랜드 오렌지 아님
- **Tailwind 사용 시**: `orange-*` / `slate-*` 클래스를 위 토큰에 매핑
- **본문에 오렌지 금지**: 오렌지는 CTA, 아이콘, 강조 전용
- **유채색은 오렌지 단 하나**: 파란색 accent 금지 (레거시 `#005EFF` 사용 금지)

이 규칙을 위반하는 UI 코드는 리뷰 통과 불가.

## DB 마이그레이션 규칙 (필수)

`supabase/migrations/` 아래에 새 `.sql` 파일을 작성한 즉시 반드시 아래 명령을 실행해 Supabase에 직접 적용한다:

```bash
node scripts/db-migrate.mjs
```

- git push 없이 바로 적용됨
- 이미 적용된 마이그레이션은 자동으로 skip
- `SUPABASE_ACCESS_TOKEN`이 `.env.local`에 없으면 실행 불가 — 토큰이 없을 경우 사용자에게 설정 요청 후 대기
