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
  is_menu_available boolean not null default true
);

