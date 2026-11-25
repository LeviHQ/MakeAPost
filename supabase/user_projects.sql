-- ==============================================================================
-- MakeAPost — Auto-Learned Project Memory Migration
-- Adds a single lightweight JSONB column to public.users storing up to 5
-- most recently updated projects: [{ slug, name, summary, updatedAt }]
-- ==============================================================================

alter table public.users
  add column if not exists projects jsonb not null default '[]'::jsonb;
