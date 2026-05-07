-- Update RLS policies for conversation_messages to allow admins
drop policy if exists "conversation_messages_insert_participants" on public.conversation_messages;
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
        t.creator_id = auth.uid()
        or t.buyer_id = auth.uid()
        -- Allow admins to insert into any thread they are part of
        -- (Wait, the above already covers it if they are participants)
        -- But we also need to allow them to insert with sender_role = 'admin'
      )
  )
);

-- Actually, let's make a specific policy for admins if they have a special role in auth.users
-- But since we use the admin client for some things, maybe we just need to ensure 
-- the participant check is enough.

-- The original policy had:
-- (t.creator_id = auth.uid() and sender_role = 'creator')
-- or (t.buyer_id = auth.uid() and sender_role = 'buyer')
-- This is what blocked admins.

-- New policy:
drop policy if exists "conversation_messages_insert_participants" on public.conversation_messages;
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
        t.creator_id = auth.uid()
        or t.buyer_id = auth.uid()
      )
  )
);

-- Also allow admins to see ALL threads and messages if they are truly admins
-- (This depends on how we identify admins in SQL. Usually via a 'role' column in profiles)
-- For now, the participant-based approach is enough for "private" chats.

-- If we want admins to see everything for oversight:
-- create policy "admin_select_all_threads" on public.conversation_threads for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
