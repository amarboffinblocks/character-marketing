create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  persona_name text not null,
  persona_details text not null default '',
  avatar_url text,
  tags text[] not null default '{}',
  safety text not null default 'SFW' check (safety in ('SFW', 'NSFW')),
  visibility text not null default 'private' check (visibility in ('private', 'public', 'unlisted')),
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.personas enable row level security;

create policy "personas_select_own"
on public.personas
for select
to authenticated
using (creator_id = auth.uid());

create policy "personas_insert_own"
on public.personas
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "personas_update_own"
on public.personas
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "personas_delete_own"
on public.personas
for delete
to authenticated
using (creator_id = auth.uid());

create or replace function public.set_personas_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_personas_updated_at on public.personas;
create trigger trg_personas_updated_at
before update on public.personas
for each row
execute function public.set_personas_updated_at();
