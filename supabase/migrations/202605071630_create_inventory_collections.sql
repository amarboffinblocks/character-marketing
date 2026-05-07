-- Create separate collections (tables) for buyer-owned assets to ensure complete isolation from creator master files.

-- 1. Inventory Characters
create table if not exists public.inventory_characters (
  id uuid primary key default gen_random_uuid(),
  original_id uuid, -- Reference to the original creator character
  owner_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid references public.profiles(id) on delete set null,
  character_name text not null,
  avatar_url text,
  background_url text,
  visibility text default 'private',
  safety text default 'SFW',
  tags text[] default '{}',
  description text,
  scenario text,
  personality_summary text,
  first_message text,
  alternative_messages text,
  example_dialogue text,
  author_notes text,
  character_notes text,
  status text default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Inventory Personas
create table if not exists public.inventory_personas (
  id uuid primary key default gen_random_uuid(),
  original_id uuid,
  creator_id uuid references public.profiles(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  persona_name text not null,
  persona_details text,
  avatar_url text,
  tags text[] default '{}',
  safety text default 'SFW',
  visibility text default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Inventory Lorebooks
create table if not exists public.inventory_lorebooks (
  id uuid primary key default gen_random_uuid(),
  original_id uuid,
  creator_id uuid references public.profiles(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  lorebook_name text not null,
  description text,
  avatar_url text,
  tags text[] default '{}',
  safety text default 'SFW',
  visibility text default 'private',
  entries jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Inventory Avatars
create table if not exists public.inventory_avatars (
  id uuid primary key default gen_random_uuid(),
  original_id uuid,
  creator_id uuid references public.profiles(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  avatar_name text not null,
  image_url text,
  tags text[] default '{}',
  safety text default 'SFW',
  visibility text default 'private',
  style text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Inventory Backgrounds
create table if not exists public.inventory_backgrounds (
  id uuid primary key default gen_random_uuid(),
  original_id uuid,
  creator_id uuid references public.profiles(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  background_name text not null,
  image_url text,
  tags text[] default '{}',
  safety text default 'SFW',
  visibility text default 'private',
  type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices for performance
create index if not exists inventory_characters_owner_idx on public.inventory_characters(owner_id);
create index if not exists inventory_personas_owner_idx on public.inventory_personas(owner_id);
create index if not exists inventory_lorebooks_owner_idx on public.inventory_lorebooks(owner_id);
create index if not exists inventory_avatars_owner_idx on public.inventory_avatars(owner_id);
create index if not exists inventory_backgrounds_owner_idx on public.inventory_backgrounds(owner_id);
