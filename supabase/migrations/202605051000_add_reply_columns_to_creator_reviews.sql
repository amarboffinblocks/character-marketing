-- Add inline reply columns to creator_reviews so the reply API
-- and read API work without a separate join on creator_review_replies.
-- The creator_review_replies table can be kept for historical audit
-- but the authoritative reply is stored here.

alter table public.creator_reviews
  add column if not exists creator_reply       text          null,
  add column if not exists creator_replied_at  timestamptz   null;

-- 1. Reviewer update policy removed (Customer can only delete)
drop policy if exists creator_reviews_reviewer_update_own on public.creator_reviews;

-- 2. Creator can update (reply to) reviews targeting them.
drop policy if exists creator_reviews_creator_update_own on public.creator_reviews;
create policy creator_reviews_creator_update_own
on public.creator_reviews for update
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

-- 3. Reviewer can delete own review.
drop policy if exists creator_reviews_reviewer_delete_own on public.creator_reviews;
create policy creator_reviews_reviewer_delete_own
on public.creator_reviews for delete
using (reviewer_id = auth.uid());

-- 4. Creator can delete reviews targeting them.
drop policy if exists creator_reviews_creator_delete_own on public.creator_reviews;
create policy creator_reviews_creator_delete_own
on public.creator_reviews for delete
using (creator_id = auth.uid());
