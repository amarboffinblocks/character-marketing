alter table public.conversation_threads
  add column if not exists creator_avatar_url text not null default '',
  add column if not exists buyer_avatar_url text not null default '';
