# MakeAPost — Supabase Google Auth & Settings Sync (Free Tier Architecture)

> Documentation for the Google OAuth authentication flow, PostgreSQL schema, Row Level Security (RLS) policies, `/settings` preferences sync, and AI generation route verification.

---

## 1. Overview & Architecture Decision
To maximize user growth and eliminate barrier-to-entry friction, all subscription paywalls, 3-day trial expirations, and daily credit caps (formerly 5 or 40/day) have been completely removed from the frontend UI, backend API routes, and database schema. 
- **Image Editor (70% Canvas):** 100% Free, client-side, and accessible without login.
- **AI Post Generator (30% Sidebar):** Requires Google OAuth sign-in (to prevent anonymous bot scraping and rate-limit attacks), but is 100% free with unlimited generation.
- **Billing & Subscriptions:** Decoupled and deferred until a future release when a comprehensive billing system (e.g. Stripe/LemonSqueezy) is introduced.

---

## 2. PostgreSQL Schema & Database Trigger (`supabase/schema.sql`)

### `public.users` Table Definition
```sql
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  theme text default 'light' check (theme in ('light', 'dark')),
  default_watermark text default 'made with makeapost.app',
  created_at timestamptz default now()
);
```

### Row Level Security (RLS) Policies
1. **Read Own Profile (`SELECT`):**
   ```sql
   create policy "Users can read own profile"
     on public.users for select to authenticated
     using (auth.uid() = id);
   ```
2. **Update Preferences (`UPDATE`):**
   ```sql
   create policy "Users can update own profile"
     on public.users for update to authenticated
     using (auth.uid() = id)
     with check (auth.uid() = id);
   ```

### Auth Trigger (`on_auth_user_created`)
Automatically inserts a new record into `public.users` upon Google OAuth signup:
- Captures `email`, `full_name`, and `avatar_url` from Google OAuth metadata.
- Sets initial preference: `theme = 'light'`.

---

## 3. Supabase Client Architecture

### 1. Browser Client (`src/lib/supabase/client.js`)
Uses `createBrowserClient` from `@supabase/ssr` to access session data, auth listeners, and client-side preference updates:
```js
import { createBrowserClient } from '@supabase/ssr';
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

### 2. Server SSR Client (`src/lib/supabase/server.js`)
Uses `createServerClient` with Next.js `cookies()` to authenticate requests in Route Handlers and Server Components.

### 3. Service Role Admin Client (`src/lib/supabase/admin.js`)
Available for administrative backend operations using `SUPABASE_SERVICE_ROLE_KEY`.

### 4. Auth Callback (`src/app/auth/callback/route.js`)
Exchanges the OAuth `code` parameter for an active session via `supabase.auth.exchangeCodeForSession(code)` and redirects to `/editor`.

---

## 4. Global Cross-Device Theme Sync (`UserThemeSync.js`) & Navbar

### `UserThemeSync.js` (`src/components/UserThemeSync.js`)
Mounted in `RootLayout` (`src/app/layout.js`) to provide seamless, zero-flash cross-device theme synchronization:
- **Guest / Fresh User:** Defaults strictly to `light` mode.
- **Logged-in User:** The Supabase PostgreSQL record (`public.users.theme`) serves as the single source of truth. As soon as the user logs in on any device, their saved theme preference (`light` or `dark`) is fetched and applied to `document.documentElement.setAttribute('data-theme', theme)` and `localStorage`.
- **Sign Out:** Automatically resets `data-theme` to `light`.

### Navbar Navigation (`src/components/NavbarAuth.js`)
Mounted in both `/` (Landing Page) and `/editor` (Studio top bar):
- **Guest State (Logged Out):**
  - Displays a tactile Neobrutalist `"Continue with Google"` button.
  - Image Editor on the 70% canvas remains 100% free and functional without login.
- **Authenticated State (Logged In):**
  - Displays a clean tactile Neobrutalist `"Settings"` button (`<Settings size={15} />`) linking directly to `/settings`.
  - Profile avatar photo and theme toggle are excluded from the navbar to maintain minimal clutter; theme selection and profile management are centralized inside `/settings`.

---

## 5. Protected Settings Canvas (`src/app/settings/page.js`)

A dedicated Neobrutalist dashboard organized into 2 high-contrast cards:
1. **Responsive Header Navbar:**
   - On Desktop: Features dual navigation buttons: `"Back to Home"` (`/`) and `"Back to Studio"` (`/editor`).
   - On Mobile: Provides a tactile Neobrutalist hamburger menu button (`<Menu size={20} />` / `<X size={20} />`) that expands a clean dropdown with both destination buttons without navbar crowding.
2. **Profile Card:** Google avatar, display name, email address, user ID snippet, and `"Sign Out"` button.
3. **Cross-Device Studio Preferences Card:**
   - **Theme Preference:** Neobrutalist Light/Dark selector buttons that persist immediately to Supabase, browser DOM, and localStorage, syncing seamlessly across all logged-in devices.
4. **Watermark & Creator Branding Card:**
   - **Default Badge:** Standard `"made with makeapost.app"` bottom-right pill badge.
   - **Custom Brand Handle:** User-defined handle or URL (e.g. `@adarshmishra` or `myproduct.dev`, max 40 chars) to turn exported graphics into personal promotion.
   - **Clean Export (None):** Hides watermark badge completely for clean screenshots.
   - **Live Preview:** Interactive simulation badge pill showing how it renders on the canvas.
   - **Upcoming Billing Mapping:** Decoupled and fully free during Beta; designed to map to Free (Default), Pro (Clean Export), and Advanced (Custom Brand) in future billing releases.

---

## 6. Backend API Gate (`src/app/api/generate/route.js`)

Before invoking Google Gemini Vision, the backend executes authentication verification:
1. **Authentication Check:** Verifies user via `createServerClient()`. Returns `401 Unauthorized` (`AUTH_REQUIRED`) if not logged in.
2. **Gemini Key Check:** Validates that `GEMINI_API_KEY` is present.
3. **Sharp Compression Gate:** Downsamples screenshot buffer to max 640px width JPEG at 60% quality.
4. **Gemini Vision Invocation:** Single-shot generation returning `x_post`, `linkedin_post`, and `reddit_post`.
