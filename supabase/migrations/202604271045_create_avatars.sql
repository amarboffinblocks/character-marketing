create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  avatar_name text not null,
  image_url text,
  tags text[] not null default '{}',
  safety text not null default 'SFW' check (safety in ('SFW', 'NSFW')),
  visibility text not null default 'private' check (visibility in ('private', 'public', 'unlisted')),
  style text not null default 'semi-real' check (style in ('anime', 'realistic', 'semi-real')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.avatars enable row level security;

create policy "avatars_select_own"
on public.avatars
for select
to authenticated
using (creator_id = auth.uid());

create policy "avatars_insert_own"
on public.avatars
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "avatars_update_own"
on public.avatars
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "avatars_delete_own"
on public.avatars
for delete
to authenticated
using (creator_id = auth.uid());

create or replace function public.set_avatars_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_avatars_updated_at on public.avatars;
create trigger trg_avatars_updated_at
before update on public.avatars
for each row
execute function public.set_avatars_updated_at();
