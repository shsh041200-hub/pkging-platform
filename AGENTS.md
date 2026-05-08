<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 디자인 시스템 (필수 — 모든 UI 작업 적용)

**[`DESIGN.md`](./DESIGN.md)는 packlinx.com의 공식 디자인 시스템이다.** 모든 프론트엔드 작업 전에 반드시 읽어야 한다.

Stripe-inspired 디자인 시스템 핵심 규칙 요약 (전체 규칙은 반드시 DESIGN.md 참조):

- **Primary CTA 버튼**: `#533afd` (Stripe Purple) 배경 + 흰색 텍스트. 호버 시 `#4434d4`
- **헤딩 텍스트**: `#061b31` (Deep Navy) — 순수 블랙 금지
- **본문 텍스트**: `#64748d` (Slate)
- **링크/인터랙티브**: `#533afd` (Stripe Purple) — 오렌지 accent 금지
- **폰트**: `sohne-var` + OpenType `"ss01"` 필수. 헤딩 weight 300
- **그림자**: `rgba(50,50,93,0.25)` 블루틴트 멀티레이어 — 회색 그림자 금지
- **Border radius**: 4px–8px — pill shape / 12px+ 금지
- **다크 섹션**: `#1c1e54` (Brand Dark) — 검정 또는 회색 금지
- **장식 accent**: Ruby(`#ea2261`), Magenta(`#f96bee`) — 버튼/링크에는 사용 금지
- **코드**: `SourceCodePro` 12px weight 500, line-height 2.00

이 규칙을 위반하는 UI 코드는 리뷰 통과 불가.

## DB 마이그레이션 규칙 (필수)

`supabase/migrations/` 아래에 새 `.sql` 파일을 작성하면 **반드시 아래 순서를 따른다**:

1. `git add supabase/migrations/<파일명>.sql` — 마이그레이션은 반드시 버전 관리에 포함
2. `git commit` — 마이그레이션 파일을 코드와 함께 커밋
3. DB 적용:
   ```bash
   node scripts/db-migrate.mjs
   ```

순서를 지키지 않으면 스키마 히스토리가 git에서 누락된다.

**스크립트 동작:**
- git push 없이 바로 적용됨
- 마이그레이션은 `IF NOT EXISTS` / `ON CONFLICT` 패턴 사용 — 재실행 안전
- `SUPABASE_ACCESS_TOKEN`이 `.env.local`에 없으면 실행 불가 — 토큰이 없을 경우 사용자에게 설정 요청 후 대기
  (발급: https://supabase.com/dashboard/account/tokens)
