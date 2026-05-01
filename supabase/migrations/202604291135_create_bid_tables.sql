create table if not exists public.bid_posts (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  duration text not null default '',
  budget text not null default '',
  token_count text not null default '',
  character_count integer not null default 0,
  persona_count integer not null default 0,
  lorebook_count integer not null default 0,
  background_count integer not null default 0,
  avatar_count integer not null default 0,
  skills_needed text not null default '',
  description text not null default '',
  is_price_negotiable boolean not null default false,
  status text not null default 'pending' check (status in ('global_bid','pending','processing','completed','rejected')),
  assigned_creator_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bid_interests (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bid_posts(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'interested' check (status in ('interested','assigned','withdrawn')),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (bid_id, creator_id)
);

create index if not exists bid_posts_requester_created_idx
  on public.bid_posts (requester_id, created_at desc);

create index if not exists bid_posts_status_idx
  on public.bid_posts (status);

create index if not exists bid_interests_bid_status_idx
  on public.bid_interests (bid_id, status);
