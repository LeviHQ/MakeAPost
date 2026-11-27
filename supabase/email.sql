-- ==============================================================================
-- MakeAPost — Transactional Email Guard Migration
-- ==============================================================================
-- Ensures the one-time Welcome Email is sent strictly once per Google user.

alter table public.users
  add column if not exists welcome_email_sent boolean not null default false;
