# 12. Bring Your Own Gemini API Key (BYOK — Advanced Plan)

## Overview
Advanced Plan (`$15/mo`) users can optionally connect their own Google Gemini API key (`AIza...`) in `/settings` to run AI Post Mode on a dedicated generation lane without sharing the default platform key's rate limits—or switch back to **Use Default Platform Key** at any time.

---

## Strict Single-Key Rule
- Only **one** Gemini API key is ever active per request (`use_custom_gemini_key = true` -> Custom Key ONLY; `use_custom_gemini_key = false` or `plan !== 'advanced'` -> Default Platform `GEMINI_API_KEY` ONLY).
- Both keys are never mixed or silently fallen back between each other on failure.

---

## Implementation Files
- **Database Migration (`supabase/byok.sql`):** Adds `custom_gemini_api_key` and `use_custom_gemini_key` to `public.users`, protected by `prevent_user_plan_tampering()`.
- **Settings API (`src/app/api/settings/api-key/route.js`):**
  - `GET`: Returns `{ canUseCustomKey, useCustomGeminiKey, hasCustomKey, maskedKey }` (raw key is never returned to browser).
  - `POST`: Switches between `mode: 'default'` and `mode: 'custom'` (strictly gated to `planId === 'advanced'`, validates `AIza...` format, supports `clearKey: true`).
- **Generation & Status (`src/app/api/generate/route.js`, `src/app/api/credits/status/route.js`):**
  - Reads `use_custom_gemini_key` & `custom_gemini_api_key` for Advanced users and surfaces `useCustomGeminiKey` badge in `AiStudio.js`.
- **Settings UI (`src/app/settings/page.js`):**
  - Card 5: **AI Engine & Gemini API Key (BYOK)** with mutually exclusive cards, masked saved key status (`ACTIVE` / `STANDBY`), Remove Key action, and Advanced-only `UpgradeModal` gate for Free/Pro users.
