# MakeAPost — Phase 5: Supabase Auth, Settings Sync & Credit Enforcement

> Documentation for the Google OAuth authentication flow, PostgreSQL schema, Row Level Security (RLS) policies, `/settings` preferences sync, and backend trial/daily credit enforcement.

---

## 1. PostgreSQL Schema & Database Trigger (`supabase/schema.sql`)

### `public.users` Table Definition
```sql
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
3. **Tamper-Proof Trigger (`prevent_user_plan_tampering`):**
   To prevent clients from altering `plan`, `trial_ends_at`, or `daily_credits_used`, a PostgreSQL `BEFORE UPDATE` trigger forces these values back to their previous values if executed by an `authenticated` user role, reserving mutation privileges solely to the service role admin client.

### Auth Trigger (`on_auth_user_created`)
Automatically inserts a new record into `public.users` upon Google OAuth signup:
- Starts a 3-day countdown (`trial_ends_at = now() + interval '3 days'`).
- Sets `plan = 'trial'`, `daily_credits_used = 0`, and `last_credit_reset = current_date`.

---

## 2. Supabase Client Architecture

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
Instantiated with `SUPABASE_SERVICE_ROLE_KEY` to securely bypass RLS for credit quota verification, daily midnight resets, and post-generation credit increments.

### 4. Auth Callback (`src/app/auth/callback/route.js`)
Exchanges the OAuth `code` parameter for an active session via `supabase.auth.exchangeCodeForSession(code)` and redirects to `/editor`.

---

## 3. Navbar Auth Integration & Cross-Device Sync (`src/components/NavbarAuth.js`)

Mounted in both `/` (Landing Page) and `/editor` (Studio top bar):
- **Guest State (Logged Out):**
  - Displays a tactile Neobrutalist `"Continue with Google"` button + guest `ThemeToggle`.
  - Image Editor on the 70% canvas remains 100% free and functional without login.
- **Authenticated State (Logged In):**
  - Fetches the user's profile from `public.users`.
  - Automatically syncs saved `theme` (`light`/`dark`) to `document.documentElement` and `localStorage`.
  - Displays a compact credit badge:
    - Trial: `⚡ X/5 left` (in `#FFD93D`)
    - Pro: `⚡ X/40 left` (in `#38BDF8`)
    - Expired: `Trial Expired` (in red outline)
  - Shows user avatar linking to `/settings`.
  - Tactical `⚙️ Settings` button.

---

## 4. Protected Settings Canvas (`src/app/settings/page.js`)

A dedicated Neobrutalist dashboard organized into 3 high-contrast cards:
1. **Profile Card:** Google avatar, display name, email address, user ID snippet, and `"Sign Out"` button.
2. **Subscription & Daily Credits Card:**
   - Displays plan status (`3-Day Free Trial`, `Pro`, or `Trial Expired`).
   - Trial countdown (`X days left` or `X hours left`).
   - Daily AI generation progress meter (`daily_credits_used / maxDaily`).
   - `"Upgrade to Pro"` CTA with tactile modal detailing 40 generations/day benefits.
3. **Cross-Device Studio Preferences Card:**
   - **Theme Preference:** Neobrutalist Light/Dark selector buttons that persist immediately to Supabase and browser DOM.
   - **Default Watermark Handle:** Input field saving custom handle (`@yourhandle` or `yoursite.com`) directly to `public.users` and `localStorage`, automatically pre-filling the exported canvas watermark in `CanvasEditor.js`.

---

## 5. Backend Credit Gate (`src/app/api/generate/route.js`)

Before invoking Google Gemini Vision, the backend executes a 4-step security and credit verification gate:
1. **Authentication Check:** Verifies user via `createServerClient()`. Returns `401 Unauthorized` (`AUTH_REQUIRED`) if not logged in.
2. **Daily Reset Check:** If `last_credit_reset < CURRENT_DATE`, resets `daily_credits_used = 0` and updates `last_credit_reset = CURRENT_DATE`.
3. **Trial Expiration Check:** If `plan === 'trial'` and `now() > trial_ends_at`, updates `plan = 'expired'` and returns `403 Forbidden` (`TRIAL_EXPIRED`).
4. **Daily Quota Enforcement:**
   - Trial: `5` generations / day.
   - Pro: `40` generations / day.
   - If `daily_credits_used >= maxDaily`, returns `429 Too Many Requests` (`DAILY_LIMIT_REACHED`).
5. **Success Increment:** Only after Gemini returns valid structured JSON, increments `daily_credits_used` by `1` via `admin.js` and returns updated credit counts to the client.
