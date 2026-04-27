create table if not exists public.lorebooks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  lorebook_name text not null,
  avatar_url text,
  tags text[] not null default '{}',
  safety text not null default 'SFW' check (safety in ('SFW', 'NSFW')),
  visibility text not null default 'private' check (visibility in ('private', 'public', 'unlisted')),
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lorebooks enable row level security;

create policy "lorebooks_select_own"
on public.lorebooks
for select
to authenticated
using (creator_id = auth.uid());

create policy "lorebooks_insert_own"
on public.lorebooks
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "lorebooks_update_own"
on public.lorebooks
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "lorebooks_delete_own"
on public.lorebooks
for delete
to authenticated
using (creator_id = auth.uid());

create or replace function public.set_lorebooks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lorebooks_updated_at on public.lorebooks;
create trigger trg_lorebooks_updated_at
before update on public.lorebooks
for each row
execute function public.set_lorebooks_updated_at();
