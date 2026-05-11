# orderly

這是一個餐飲店的簡單 pos 系統

## POS 功能

### 商家功能

- 訂單管理
- 目錄管理
- 商品管理
- 商品選項(加量等...)
- 菜單管理

- 商家基本設定
- 商家營業時間
- 金流設定

- 支出管理
  - 列表
  - 支出紀錄/報表
- 報表: 日/月報表
- 銷售分析
  日訂單數統計、日銷售額統計、來源統計、付款統計、熱門時段分析、熱門星期分析、銷售數量排名、銷售額排名

- 供應商列表
- 原物料列表
- 客戶列表

### 客戶功能

- QRcode 點餐

### 資料庫 Schema

**stores** — 商家

- id, name, description, logo_url, opening, phone, address,

**categories** — 目錄

- id, name, rank

**products** — 商品

- id, category_id, name, description, price, image_url, is_available

**product_type** — 商品選項種類（冰量）

- id, product_id, name, price, is_disable, max, min

**product_options** — 商品選項細（正常，少冰）

- id, product_type_id, name, price, is_default, is_disable

**menus** — 菜單（商品組合/時段）

- id, name, is_active

**menu_products** — 菜單與商品關聯

- id, menu_id, product_id

**orders** — 訂單

- id, table_no, status, total, payment_method, created_at

**order_items** — 訂單明細

- id, order_id, product_id, quantity, unit_price, options (jsonb)

**customers** — 客戶

- id, name, phone, email

# 規劃

## phase1 架構建立

### 使用技術

- 使用 nextjs (App Router)
- UI: shadcn + tailwind + diceui
- db: supabase
- orm: prisma
- store: zustand
- http client: axios
- other tool: day.js, recharts
- Vercel 部署
- Supabase 雲端托管

### 目錄架構

```
src/
├── app/
│   ├── (auth)/        # 登入/註冊頁
│   ├── (dashboard)/   # 商家後台頁面
│   ├── menu/          # 客戶點餐頁（QRcode 指向此路由）
│   └── api/           # REST API 接口
├── components/
│   ├── ui/            # shadcn 基礎元件
│   ├── ...            # 各功能 UI 元件
│   └── shared/        # 共用元件（sidebar、header）
├── lib/
│   ├── supabase/      # db 連線
│   └── queries/       # db 查詢邏輯
├── store/             # zustand 狀態（購物車、UI 狀態）
└── types/             # 共用型別定義
```

Step

- 初始化專案 — create-next-app，選 TypeScript + App Router + Tailwind
- 建立目錄結構 — 按規劃建立 (auth)、(dashboard)、menu、api 等資料夾

- 安裝套件 — shadcn/ui 初始化
- Supabase 設定 — 建立專案、設定 env 變數、建立 lib/supabase/client.ts 和 server.ts
- 建立 DB Schema — 在 Supabase 建 table（stores、categories、products、orders 等）

- 後台 Layout — (dashboard)/layout.tsx 加上 sidebar、header 基本骨架
- 確認 API 路由可通 — 建一個簡單的 api/health/route.ts 測試

- 安裝套件 — zustand、supabase client
- Auth 設定 — Supabase Auth 整合、登入/登出、middleware 保護後台路由

### 環境設定

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

## order realtime

GRANT SELECT ON orders TO authenticated;
REVOKE SELECT ON orders FROM authenticated;

## Goal

- [] 點錢紀錄 加上 顯示 "已結帳", delete 的 order。 使用 payment 分組，使用 Accordion
- [] 實做複製 支出
- [] 作廢的訂單 要在 note 寫 作廢訂單
- [] order list 的畫面 table 要 可以顯示全部
- [] 銷售分析:
  - 日訂單統計: 每日的訂單總數
  - 日銷售統計: 每日的訂單總銷售
  - 熱門時段分析: 每日的時段的訂單總數
  - 熱門星期分析: 每日的訂單總數 以周為顯示
  - 銷售數量排名: 商品銷售數量 排序
  - 銷售額排名: 商品銷售額 排序
  - 同業分析: 比較去年月的 銷售額 (以月/季為單位)
  - 銷售毛利分析: 數量，銷售額，成本，利潤

- 資料同步
  - [x] order
  - [x] expense
  - [x] product
  - [x] table
  - [x] payment
  - [] money count

- 檢查資料正確性
