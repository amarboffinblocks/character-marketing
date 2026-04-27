alter table if exists public.lorebooks
add column if not exists description text not null default '';
