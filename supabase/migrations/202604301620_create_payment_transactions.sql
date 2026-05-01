create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  payment_method text not null default 'card',
  provider text not null default 'manual',
  provider_reference text not null default '',
  status text not null default 'succeeded' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists payment_transactions_order_id_created_at_idx
  on public.payment_transactions (order_id, created_at desc);

create index if not exists payment_transactions_buyer_id_created_at_idx
  on public.payment_transactions (buyer_id, created_at desc);

create index if not exists payment_transactions_creator_id_created_at_idx
  on public.payment_transactions (creator_id, created_at desc);
