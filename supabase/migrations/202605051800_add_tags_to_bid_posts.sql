alter table public.bid_posts
add column if not exists tags text not null default '';
