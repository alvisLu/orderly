@AGENTS.md

# 架構規則

所有 Supabase 資料操作（CRUD）必須在 Server 端執行：

- 使用 Next.js Server Action 或 API Route
- 呼叫 `@/lib/supabase/server` 的 `createClient()`
- 禁止在 Client Component 直接呼叫 Supabase 做資料操作
- `@/lib/supabase/client` 只用於 Auth（登入/登出）
