create table if not exists public.creator_services (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  service_name text not null,
  description text not null default '',
  price integer not null default 0,
  discounted_price integer,
  tokens_label text not null default '',
  persona_count integer not null default 0,
  lorebook_count integer not null default 0,
  background_count integer not null default 0,
  avatar_count integer not null default 0,
  character_count integer not null default 0,
  highlights text[] not null default '{}',
  is_recommended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_services enable row level security;

create policy "creator_services_select_own"
on public.creator_services
for select
to authenticated
using (creator_id = auth.uid());

create policy "creator_services_insert_own"
on public.creator_services
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "creator_services_update_own"
on public.creator_services
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "creator_services_delete_own"
on public.creator_services
for delete
to authenticated
using (creator_id = auth.uid());

create or replace function public.set_creator_services_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_creator_services_updated_at on public.creator_services;
create trigger trg_creator_services_updated_at
before update on public.creator_services
for each row
execute function public.set_creator_services_updated_at();
