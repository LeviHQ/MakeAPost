-- ==============================================================================
-- MakeAPost — Bring Your Own Gemini API Key (BYOK — Advanced Plan Only)
-- ==============================================================================

alter table public.users
  add column if not exists custom_gemini_api_key text,
  add column if not exists use_custom_gemini_key boolean not null default false;

-- Update tamper-proof trigger to lock BYOK columns from direct client-side mutation
-- (Server route /api/settings/api-key updates them safely after verifying Advanced plan)
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
    new.custom_gemini_api_key := old.custom_gemini_api_key;
    new.use_custom_gemini_key := old.use_custom_gemini_key;
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
