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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references public.creator_reviews(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_reviews_creator_id_created_at_idx
  on public.creator_reviews (creator_id, created_at desc);

create index if not exists creator_reviews_reviewer_id_created_at_idx
  on public.creator_reviews (reviewer_id, created_at desc);

create index if not exists creator_reviews_status_idx
  on public.creator_reviews (status);

create index if not exists creator_review_replies_creator_id_created_at_idx
  on public.creator_review_replies (creator_id, created_at desc);

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

drop trigger if exists set_creator_review_replies_updated_at on public.creator_review_replies;
create trigger set_creator_review_replies_updated_at
before update on public.creator_review_replies
for each row
execute function public.set_updated_at_timestamp();

alter table public.creator_reviews enable row level security;
alter table public.creator_review_replies enable row level security;

-- Public can read only published reviews for marketplace/profile display.
drop policy if exists creator_reviews_public_read_published on public.creator_reviews;
create policy creator_reviews_public_read_published
on public.creator_reviews
for select
using (status = 'published');

-- Reviewer can read their own submitted reviews.
drop policy if exists creator_reviews_reviewer_read_own on public.creator_reviews;
create policy creator_reviews_reviewer_read_own
on public.creator_reviews
for select
using (reviewer_id = auth.uid());

-- Creator can read reviews written about them.
drop policy if exists creator_reviews_creator_read_own on public.creator_reviews;
create policy creator_reviews_creator_read_own
on public.creator_reviews
for select
using (creator_id = auth.uid());

-- Buyer/reviewer can submit a review for themselves only.
drop policy if exists creator_reviews_reviewer_insert_own on public.creator_reviews;
create policy creator_reviews_reviewer_insert_own
on public.creator_reviews
for insert
with check (
  reviewer_id = auth.uid()
  and reviewer_id <> creator_id
);

-- Reviewer can update only their own review content.
drop policy if exists creator_reviews_reviewer_update_own on public.creator_reviews;
create policy creator_reviews_reviewer_update_own
on public.creator_reviews
for update
using (reviewer_id = auth.uid())
with check (reviewer_id = auth.uid());

-- Creator can reply only to reviews targeting them.
drop policy if exists creator_review_replies_creator_insert_own on public.creator_review_replies;
create policy creator_review_replies_creator_insert_own
on public.creator_review_replies
for insert
with check (
  creator_id = auth.uid()
  and exists (
    select 1
    from public.creator_reviews r
    where r.id = review_id
      and r.creator_id = auth.uid()
  )
);

drop policy if exists creator_review_replies_creator_update_own on public.creator_review_replies;
create policy creator_review_replies_creator_update_own
on public.creator_review_replies
for update
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

-- Public/reviewer/creator can read replies when they can read parent review.
drop policy if exists creator_review_replies_read_related on public.creator_review_replies;
create policy creator_review_replies_read_related
on public.creator_review_replies
for select
using (
  exists (
    select 1
    from public.creator_reviews r
    where r.id = review_id
      and (
        r.status = 'published'
        or r.creator_id = auth.uid()
        or r.reviewer_id = auth.uid()
      )
  )
);
