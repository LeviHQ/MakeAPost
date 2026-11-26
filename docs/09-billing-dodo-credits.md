# MakeAPost — Dodo Payments Billing, Daily Credits & Exit-Guard Architecture

> Documentation for MakeAPost's 3-tier subscription system (`Free`, `Pro $7/mo`, `Advanced $15/mo`), Dodo Payments integration, per-platform AI credits, image upload credit deduction, tamper-proof PostgreSQL triggers, and Studio Exit-Guard Modal.

---

## 1. Plan Matrix (`src/lib/billing.js`)
| Tier | Price | Daily Image Edits | Daily AI Posts (Per Platform) | Watermark Access |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | `$0` | 5 / day | 2 X + 2 LinkedIn + 2 Reddit | Locked (`made with makeapost.site`) |
| **Pro** | `$7/mo` | 30 / day | 15 X + 15 LinkedIn + 15 Reddit | Default or Hide (`none`) |
| **Advanced** | `$15/mo` | 50 / day | 20 X + 20 LinkedIn + 20 Reddit | Default, Hide, or Custom Brand Handle |

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
- `POST /api/billing/webhook`: Verifies Standard Webhooks HMAC-SHA256 signatures (`webhook-id`, `webhook-timestamp`, `webhook-signature`) and syncs `subscription.active`, `renewed`, `cancelled`, `expired`, `failed`, and `on_hold`.
- `POST /api/billing/portal`: Generates a 1-click Dodo Payments customer portal URL for managing/cancelling subscriptions from `/settings`.

---

## 4. Frontend Safeguards
- **`src/components/StudioExitModal.js`:** Intercepts in-app exits from `/editor` (plus `beforeunload` on tab close) when an image credit was consumed without downloading/copying, offering direct **Download HD PNG**, **Copy PNG**, and generated **Post on X / LinkedIn / Reddit** buttons alongside remaining daily image credits.
- **`src/components/UpgradeModal.js`:** Triggered when hitting image/AI limits or clicking locked watermark controls.
