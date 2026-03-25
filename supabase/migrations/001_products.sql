-- 共用 trigger function：自動更新 updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- products — 商品
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null,
  cost numeric(10, 2) not null default 0,
  image_urls text[] not null default '{}',
  is_favorite boolean not null default false,
  is_pos_available boolean not null default true,
  is_menu_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();
