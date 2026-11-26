-- ==============================================================================
-- MakeAPost — Billing, Daily Credits & Tamper-Proof Trigger Migration
-- ==============================================================================

-- 1. Add billing & daily usage columns to public.users
alter table public.users
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pro', 'advanced')),
  add column if not exists plan_status text not null default 'active' check (plan_status in ('active', 'cancelled', 'past_due', 'on_hold')),
  add column if not exists image_credits_used int not null default 0,
  add column if not exists ai_credits_used jsonb not null default '{"x":0,"linkedin":0,"reddit":0}'::jsonb,
  add column if not exists last_credit_reset date not null default current_date,
  add column if not exists billing_customer_id text,
  add column if not exists billing_subscription_id text,
  add column if not exists current_period_end timestamptz;

alter table public.users
  alter column default_watermark set default 'made with makeapost.site';

update public.users
  set default_watermark = 'made with makeapost.site'
  where default_watermark is null or default_watermark = 'made with makeapost.app';

-- 2. Tamper-Proof Trigger: Block client-side mutation of plan, credits, billing IDs & locked watermarks
create or replace function public.prevent_user_plan_tampering()
returns trigger as $$
begin
  if current_user = 'authenticated' or auth.role() = 'authenticated' then
    -- Lock all billing & usage columns to previous server values
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

    -- Enforce watermark tier rules even on direct Supabase client updates
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
