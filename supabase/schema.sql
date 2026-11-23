-- ==============================================================================
-- MakeAPost — Phase 5: Supabase Schema, RLS & Auth Trigger
-- ==============================================================================

-- 1. Create public.users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  theme text default 'light' check (theme in ('light', 'dark')),
  default_watermark text default '',
  plan text default 'trial' check (plan in ('trial', 'pro', 'expired')),
  trial_ends_at timestamptz default (now() + interval '3 days'),
  daily_credits_used int default 0,
  last_credit_reset date default current_date,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- 3. RLS Policies
-- Allow authenticated users to view their own profile
create policy "Users can read own profile"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

-- Allow authenticated users to update their own profile
create policy "Users can update own profile"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Guard against tampering of sensitive fields (plan, trial_ends_at, credits)
create or replace function public.prevent_user_plan_tampering()
returns trigger as $$
begin
  -- If invoked by normal authenticated user, forbid altering plan or credits directly
  if current_user = 'authenticated' or auth.role() = 'authenticated' then
    new.plan := old.plan;
    new.trial_ends_at := old.trial_ends_at;
    new.daily_credits_used := old.daily_credits_used;
    new.last_credit_reset := old.last_credit_reset;
    new.id := old.id;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_user_update_safety on public.users;
create trigger enforce_user_update_safety
  before update on public.users
  for each row
  execute function public.prevent_user_plan_tampering();

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
    default_watermark,
    plan,
    trial_ends_at,
    daily_credits_used,
    last_credit_reset,
    created_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'light',
    '',
    'trial',
    now() + interval '3 days',
    0,
    current_date,
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
