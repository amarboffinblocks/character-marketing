-- Reviews and replies for creator marketplace profiles.
-- Supports buyer -> creator review flow with creator-side reply.

create table if not exists public.creator_reviews (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid null references public.orders(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text not null default '',
  body text not null,
  status text not null default 'published' check (status in ('published', 'pending', 'rejected')),
  creator_reply text null,
  creator_replied_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_reviews_creator_id_created_at_idx
  on public.creator_reviews (creator_id, created_at desc);

create index if not exists creator_reviews_reviewer_id_created_at_idx
  on public.creator_reviews (reviewer_id, created_at desc);

create index if not exists creator_reviews_status_idx
  on public.creator_reviews (status);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_creator_reviews_updated_at on public.creator_reviews;
create trigger set_creator_reviews_updated_at
before update on public.creator_reviews
for each row
execute function public.set_updated_at_timestamp();

alter table public.creator_reviews enable row level security;

-- SELECT policies
drop policy if exists creator_reviews_public_read_published on public.creator_reviews;
create policy creator_reviews_public_read_published
on public.creator_reviews for select
using (status = 'published');

drop policy if exists creator_reviews_reviewer_read_own on public.creator_reviews;
create policy creator_reviews_reviewer_read_own
on public.creator_reviews for select
using (reviewer_id = auth.uid());

drop policy if exists creator_reviews_creator_read_own on public.creator_reviews;
create policy creator_reviews_creator_read_own
on public.creator_reviews for select
using (creator_id = auth.uid());

-- INSERT policy
drop policy if exists creator_reviews_reviewer_insert_own on public.creator_reviews;
create policy creator_reviews_reviewer_insert_own
on public.creator_reviews for insert
with check (
  reviewer_id = auth.uid()
  and reviewer_id <> creator_id
);

-- UPDATE policies
-- 1. Reviewer update policy removed (Customer can only delete)
drop policy if exists creator_reviews_reviewer_update_own on public.creator_reviews;

-- 2. Creator can update (reply to) reviews targeting them.
-- Restricted to ONLY the reply columns.
drop policy if exists creator_reviews_creator_update_own on public.creator_reviews;
create policy creator_reviews_creator_update_own
on public.creator_reviews for update
using (creator_id = auth.uid());

-- DELETE policies
-- 1. Reviewer can delete own review.
drop policy if exists creator_reviews_reviewer_delete_own on public.creator_reviews;
create policy creator_reviews_reviewer_delete_own
on public.creator_reviews for delete
using (reviewer_id = auth.uid());

-- 2. Creator can delete reviews targeting them (effectively deleting both review and reply).
drop policy if exists creator_reviews_creator_delete_own on public.creator_reviews;
create policy creator_reviews_creator_delete_own
on public.creator_reviews for delete
using (creator_id = auth.uid());
