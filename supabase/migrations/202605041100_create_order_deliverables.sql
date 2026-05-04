create table if not exists public.order_deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  asset_type text not null check (asset_type in ('character', 'persona', 'lorebook', 'avatar', 'background')),
  asset_id uuid not null,
  asset_title text not null default '',
  delivery_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_deliverables_order_asset_unique unique (order_id, asset_type, asset_id)
);

create index if not exists order_deliverables_order_created_at_idx
  on public.order_deliverables (order_id, created_at desc);

create index if not exists order_deliverables_creator_created_at_idx
  on public.order_deliverables (creator_id, created_at desc);

create index if not exists order_deliverables_buyer_created_at_idx
  on public.order_deliverables (buyer_id, created_at desc);
