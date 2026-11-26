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
  default_watermark text default 'made with makeapost.site',
  plan text not null default 'free' check (plan in ('free', 'pro', 'advanced')),
  plan_status text not null default 'active' check (plan_status in ('active', 'cancelled', 'past_due', 'on_hold')),
  image_credits_used int not null default 0,
  ai_credits_used jsonb not null default '{"x":0,"linkedin":0,"reddit":0}'::jsonb,
  last_credit_reset date not null default current_date,
  billing_customer_id text,
  billing_subscription_id text,
  current_period_end timestamptz,
  projects jsonb not null default '[]'::jsonb,
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

-- 4. Guard against tampering of billing, usage credits & locked watermark fields
create or replace function public.prevent_user_plan_tampering()
returns trigger as $$
begin
  if current_user = 'authenticated' or auth.role() = 'authenticated' then
    new.plan := old.plan;
    new.plan_status := old.plan_status;
    new.image_credits_used := old.image_credits_used;
    new.ai_credits_used := old.ai_credits_used;
    new.last_credit_reset := old.last_credit_reset;
    new.billing_customer_id := old.billing_customer_id;
    new.billing_subscription_id := old.billing_subscription_id;
    new.current_period_end := old.current_period_end;
    new.id := old.id;
    new.created_at := old.created_at;

    if old.plan = 'free' then
      new.default_watermark := 'made with makeapost.site';
    elsif old.plan = 'pro' then
      if new.default_watermark is distinct from 'none' then
        new.default_watermark := 'made with makeapost.site';
      end if;
    end if;
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
    created_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'light',
    'made with makeapost.site',
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

