-- ==============================================================================
-- MakeAPost — Social OAuth Connections (LinkedIn & X Direct Publishing)
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

-- 1. Grant table permissions
grant all on table public.social_connections to postgres, anon, authenticated, service_role;

-- 2. Enable Row Level Security (RLS)
alter table public.social_connections enable row level security;

-- 3. RLS Policies
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

-- 4. Fast Lookup Index
create index if not exists idx_social_connections_user_platform
  on public.social_connections (user_id, platform);
