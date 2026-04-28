create table if not exists public.conversation_threads (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  creator_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  creator_name text not null default '',
  buyer_name text not null default '',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversation_threads_participants_distinct check (creator_id <> buyer_id)
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.conversation_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('creator', 'buyer')),
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_reads (
  thread_id uuid not null references public.conversation_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_message_id uuid references public.conversation_messages(id) on delete set null,
  last_read_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create index if not exists conversation_threads_creator_last_message_idx
  on public.conversation_threads (creator_id, last_message_at desc);

create index if not exists conversation_threads_buyer_last_message_idx
  on public.conversation_threads (buyer_id, last_message_at desc);

create index if not exists conversation_messages_thread_created_idx
  on public.conversation_messages (thread_id, created_at asc);

create index if not exists conversation_reads_user_thread_idx
  on public.conversation_reads (user_id, thread_id);

create or replace function public.set_conversation_threads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_conversation_threads_updated_at on public.conversation_threads;
create trigger trg_conversation_threads_updated_at
before update on public.conversation_threads
for each row
execute function public.set_conversation_threads_updated_at();

create or replace function public.set_conversation_reads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_conversation_reads_updated_at on public.conversation_reads;
create trigger trg_conversation_reads_updated_at
before update on public.conversation_reads
for each row
execute function public.set_conversation_reads_updated_at();

create or replace function public.sync_thread_last_message_at()
returns trigger
language plpgsql
as $$
begin
  update public.conversation_threads
  set last_message_at = new.created_at,
      updated_at = now()
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists trg_sync_thread_last_message_at on public.conversation_messages;
create trigger trg_sync_thread_last_message_at
after insert on public.conversation_messages
for each row
execute function public.sync_thread_last_message_at();

alter table public.conversation_threads enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_reads enable row level security;

create policy "conversation_threads_select_participants"
on public.conversation_threads
for select
to authenticated
using (creator_id = auth.uid() or buyer_id = auth.uid());

create policy "conversation_threads_insert_participants"
on public.conversation_threads
for insert
to authenticated
with check (creator_id = auth.uid() or buyer_id = auth.uid());

create policy "conversation_threads_update_participants"
on public.conversation_threads
for update
to authenticated
using (creator_id = auth.uid() or buyer_id = auth.uid())
with check (creator_id = auth.uid() or buyer_id = auth.uid());

create policy "conversation_messages_select_participants"
on public.conversation_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_threads t
    where t.id = thread_id
      and (t.creator_id = auth.uid() or t.buyer_id = auth.uid())
  )
);

create policy "conversation_messages_insert_participants"
on public.conversation_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversation_threads t
    where t.id = thread_id
      and (
        (t.creator_id = auth.uid() and sender_role = 'creator')
        or (t.buyer_id = auth.uid() and sender_role = 'buyer')
      )
  )
);

create policy "conversation_reads_select_own"
on public.conversation_reads
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.conversation_threads t
    where t.id = thread_id
      and (t.creator_id = auth.uid() or t.buyer_id = auth.uid())
  )
);

create policy "conversation_reads_insert_own"
on public.conversation_reads
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.conversation_threads t
    where t.id = thread_id
      and (t.creator_id = auth.uid() or t.buyer_id = auth.uid())
  )
);

create policy "conversation_reads_update_own"
on public.conversation_reads
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
