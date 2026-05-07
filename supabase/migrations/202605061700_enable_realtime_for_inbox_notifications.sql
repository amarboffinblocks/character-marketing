alter table public.inbox_notifications replica identity full;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inbox_notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.inbox_notifications';
  end if;
end
$$;
