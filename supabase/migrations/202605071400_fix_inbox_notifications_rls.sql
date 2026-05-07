-- Enable RLS
alter table public.inbox_notifications enable row level security;

-- Policies for inbox_notifications
drop policy if exists "Users can view their own notifications" on public.inbox_notifications;
create policy "Users can view their own notifications"
  on public.inbox_notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.inbox_notifications;
create policy "Users can update their own notifications"
  on public.inbox_notifications for update
  using (auth.uid() = user_id);

drop policy if exists "System can insert notifications" on public.inbox_notifications;
create policy "System can insert notifications"
  on public.inbox_notifications for insert
  with check (true); -- Usually inserted via service role/server-side

-- Ensure the table is in the realtime publication (idempotent)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inbox_notifications'
  ) then
    alter publication supabase_realtime add table public.inbox_notifications;
  end if;
end
$$;
