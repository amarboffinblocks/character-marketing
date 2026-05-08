-- Base schema for profiles, requests, orders, and notifications
-- Created at timestamp 202604230000 to precede other migrations

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profile Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 2. Enums (Using text with check constraints to match project style)

-- 3. Requests Table
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('custom_package', 'preselect_package')),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  package_id text not null,
  package_title text not null,
  package_price int not null,
  tokens_label text not null,
  request_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'accepted', 'rejected', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.requests enable row level security;

-- 4. Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique not null references public.requests(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  package_id text not null,
  package_title text not null,
  package_price int not null,
  tokens_label text not null,
  request_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'funded', 'in_progress', 'on_hold', 'delivered', 'approved', 'completed', 'cancelled', 'refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- 5. Inbox Notifications Table
create table if not exists public.inbox_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'system',
  title text not null,
  body text not null,
  action_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.inbox_notifications enable row level security;

-- Notifications Policies
create policy "Users can view own notifications." on public.inbox_notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications." on public.inbox_notifications
  for update using (auth.uid() = user_id);

-- 6. Helper Functions & Triggers

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
