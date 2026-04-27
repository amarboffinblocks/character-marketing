create table if not exists public.backgrounds (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  background_name text not null,
  image_url text,
  tags text[] not null default '{}',
  safety text not null default 'SFW' check (safety in ('SFW', 'NSFW')),
  visibility text not null default 'private' check (visibility in ('private', 'public', 'unlisted')),
  type text not null default 'indoor' check (type in ('indoor', 'outdoor', 'studio')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.backgrounds enable row level security;

create policy "backgrounds_select_own"
on public.backgrounds
for select
to authenticated
using (creator_id = auth.uid());

create policy "backgrounds_insert_own"
on public.backgrounds
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "backgrounds_update_own"
on public.backgrounds
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "backgrounds_delete_own"
on public.backgrounds
for delete
to authenticated
using (creator_id = auth.uid());

create or replace function public.set_backgrounds_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_backgrounds_updated_at on public.backgrounds;
create trigger trg_backgrounds_updated_at
before update on public.backgrounds
for each row
execute function public.set_backgrounds_updated_at();
