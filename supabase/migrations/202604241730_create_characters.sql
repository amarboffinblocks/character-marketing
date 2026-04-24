create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  character_name text not null,
  avatar_url text,
  background_url text,
  visibility text not null default 'private' check (visibility in ('private', 'public', 'unlisted')),
  safety text not null default 'SFW' check (safety in ('SFW', 'NSFW')),
  tags text[] not null default '{}',
  description text not null default '',
  scenario text not null default '',
  personality_summary text not null default '',
  first_message text not null default '',
  alternative_messages text not null default '',
  example_dialogue text not null default '',
  author_notes text not null default '',
  character_notes text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.characters enable row level security;

create policy "characters_select_own"
on public.characters
for select
to authenticated
using (creator_id = auth.uid() or owner_id = auth.uid());

create policy "characters_insert_own"
on public.characters
for insert
to authenticated
with check (creator_id = auth.uid() and owner_id = auth.uid());

create policy "characters_update_owner"
on public.characters
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "characters_delete_creator"
on public.characters
for delete
to authenticated
using (creator_id = auth.uid());

create or replace function public.set_characters_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_characters_updated_at on public.characters;
create trigger trg_characters_updated_at
before update on public.characters
for each row
execute function public.set_characters_updated_at();
