-- This is an empty migration.

-- 啟用 authenticated 角色對 orders 表的 SELECT 權限，以允許 Supabase 在有適當身份驗證的情況下讀取訂單資料。
GRANT SELECT ON orders TO authenticated;