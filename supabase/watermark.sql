-- ==============================================================================
-- MakeAPost — Migration: Restore default_watermark Column on public.users
-- ==============================================================================

-- 1. Add default_watermark column to public.users if not already present
alter table public.users 
  add column if not exists default_watermark text default 'made with makeapost.app';

-- 2. Backfill existing records where default_watermark is null
update public.users 
  set default_watermark = 'made with makeapost.app' 
  where default_watermark is null;
