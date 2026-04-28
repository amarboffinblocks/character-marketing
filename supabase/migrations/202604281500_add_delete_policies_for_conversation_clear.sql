create policy "conversation_messages_delete_participants"
on public.conversation_messages
for delete
to authenticated
using (
  exists (
    select 1
    from public.conversation_threads t
    where t.id = thread_id
      and (t.creator_id = auth.uid() or t.buyer_id = auth.uid())
  )
);

create policy "conversation_reads_delete_own"
on public.conversation_reads
for delete
to authenticated
using (user_id = auth.uid());
