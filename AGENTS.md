<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## DB 마이그레이션 규칙 (필수)

`supabase/migrations/` 아래에 새 `.sql` 파일을 작성한 즉시 반드시 아래 명령을 실행해 Supabase에 직접 적용한다:

```bash
node scripts/db-migrate.mjs
```

- git push 없이 바로 적용됨
- 이미 적용된 마이그레이션은 자동으로 skip
- `SUPABASE_ACCESS_TOKEN`이 `.env.local`에 없으면 실행 불가 — 토큰이 없을 경우 사용자에게 설정 요청 후 대기
