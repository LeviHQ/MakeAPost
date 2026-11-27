# MakeAPost — Dodo Payments Billing, Daily Credits & Exit-Guard Architecture

> Documentation for MakeAPost's 3-tier subscription system (`Free`, `Pro $7/mo`, `Advanced $15/mo`), Dodo Payments integration, per-platform AI credits, image upload credit deduction, tamper-proof PostgreSQL triggers, and Studio Exit-Guard Modal.

---

## 1. Plan Matrix (`src/lib/billing.js`)
| Tier | Price | Daily Image Edits | Daily AI Posts (Per Platform) | Watermark Access |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | `$0` | 3 / day | 1 X + 1 LinkedIn + 1 Reddit | Locked (`made with makeapost.site`) |
| **Pro** | `$7/mo` | 30 / day | 10 X + 10 LinkedIn + 10 Reddit | Default or Hide (`none`) |
| **Advanced** | `$15/mo` | 50 / day | 15 X + 15 LinkedIn + 15 Reddit | Default, Hide, or Custom Brand Handle |

---

## 2. Tamper-Proof Database & Trigger (`supabase/billing.sql`)
- `public.users` tracks `plan`, `plan_status`, `image_credits_used`, `ai_credits_used` (`{"x":0,"linkedin":0,"reddit":0}`), `last_credit_reset`, `billing_customer_id`, `billing_subscription_id`, and `current_period_end`.
- `prevent_user_plan_tampering()` (`BEFORE UPDATE` trigger) blocks `authenticated` role updates to billing/credit columns and enforces watermark restrictions at the database layer. Only `createAdminClient()` (`SUPABASE_SERVICE_ROLE_KEY`) mutates plans and credits.

---

## 3. API Routes
- `GET /api/credits/status`: Returns effective plan, midnight-reset daily image & per-platform AI usage, and watermark preference.
- `POST /api/credits/image`: Enforces Google Sign-In (`401 AUTH_REQUIRED`) and daily image edit quota (`429 IMAGE_LIMIT_REACHED`), incrementing `image_credits_used` on custom image load.
- `POST /api/generate`: Enforces per-platform daily AI limits (`429 AI_LIMIT_REACHED`) before invoking Gemini and increments only the generated platform counters.
- `POST /api/billing/checkout`: Creates a Dodo Payments checkout session (`pro` or `advanced`) with `user_id` metadata.
- `POST /api/billing/webhook`: Verifies Standard Webhooks HMAC-SHA256 signatures (`webhook-id`, `webhook-timestamp`, `webhook-signature`) and syncs `subscription.active`, `renewed`, `cancelled`, `expired`, `failed`, and `on_hold`. (Self-serve customer portal cancellation is intentionally omitted).

---

## 4. Strict Google Auth Gate, Auto-Renewing Free Cycle & Frontend Safeguards
- **Strict `/editor` Access Gate:** Unauthenticated visitors cannot view or use `/editor` — they see a full-page Google Sign-In gate until authenticated. Every signed-in user automatically starts on the Free tier on an auto-renewing 1-month rolling cycle anchored to their `created_at` date (`getFreeCycleDates()`).
- **`src/components/StudioExitModal.js`:** Intercepts in-app exits from `/editor` (plus `beforeunload` on tab close) when an image credit was consumed without downloading/copying, offering direct **Download HD PNG**, **Copy PNG**, and generated **Post on X / LinkedIn / Reddit** buttons alongside remaining daily image credits.
- **`src/components/UpgradeModal.js` & `src/components/LandingPricingSection.js`:** Triggered when hitting image/AI limits or clicking locked watermark controls, or via `"Upgrade for Powerful Experience"` buttons on the homepage Pricing section.
