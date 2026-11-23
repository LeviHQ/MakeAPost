-- ==============================================================================
-- MakeAPost — Supabase Schema, RLS & Auth Trigger (Preferences & Auth Only)
-- ==============================================================================

-- 1. Create public.users table (Profile & Cross-Device Preferences)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  theme text default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz default now()
);

-- 2. Grant essential table permissions
grant all on table public.users to postgres, anon, authenticated, service_role;

-- 3. Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- 3. RLS Policies
-- Allow authenticated users to view their own profile
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

-- Allow authenticated users to update their own profile (theme, watermark)
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Clean up legacy columns & triggers if migrating from previous version
drop trigger if exists enforce_user_update_safety on public.users;
drop function if exists public.prevent_user_plan_tampering();

alter table public.users 
  drop column if exists plan,
  drop column if exists trial_ends_at,
  drop column if exists daily_credits_used,
  drop column if exists last_credit_reset,
  drop column if exists default_watermark;

-- 5. Trigger: Automatically insert a row in public.users on auth signup (e.g. Google OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (
    id,
    email,
    full_name,
    avatar_url,
    theme,
    created_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'light',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ==============================================================================
-- 6. Social OAuth Connections (LinkedIn & X Direct Publishing)
-- ==============================================================================

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin')),
  platform_user_id text,
  platform_username text,
  access_token_enc text not null,
  refresh_token_enc text,
  expires_at timestamptz,
  updated_at timestamptz default now(),
  constraint social_connections_user_platform_key unique (user_id, platform)
);

-- Grant table permissions
grant all on table public.social_connections to postgres, anon, authenticated, service_role;

-- Enable Row Level Security (RLS)
alter table public.social_connections enable row level security;

-- Allow authenticated users to view their own connections
drop policy if exists "Users can view own social connections" on public.social_connections;
create policy "Users can view own social connections"
  on public.social_connections
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to delete (disconnect) their own connections
drop policy if exists "Users can delete own social connections" on public.social_connections;
create policy "Users can delete own social connections"
  on public.social_connections
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Fast Lookup Index
create index if not exists idx_social_connections_user_platform
  on public.social_connections (user_id, platform);

