-- Remove the unique constraint on order_id
alter table public.conversation_threads drop constraint if exists conversation_threads_order_id_key;

-- Add a composite unique constraint on order_id, creator_id, and buyer_id
-- This allows multiple threads for the same order, as long as the participant pairs are different.
alter table public.conversation_threads add constraint conversation_threads_order_participants_key unique (order_id, creator_id, buyer_id);
