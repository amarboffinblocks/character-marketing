alter table public.conversation_messages
  drop constraint if exists conversation_messages_sender_role_check;

alter table public.conversation_messages
  add constraint conversation_messages_sender_role_check
  check (sender_role in ('creator', 'buyer', 'admin'));
