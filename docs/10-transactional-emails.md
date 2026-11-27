# 10. Transactional Emails (Resend) & Contact Support Flow

## Overview
MakeAPost uses **Resend** (`https://api.resend.com/emails`) for strictly transactional, billing, and user-initiated support emails. Zero marketing spam is sent, and all email calls are non-blocking (`try/catch`) so authentication and payment webhooks never fail if email delivery has a transient issue.

---

## Email Touchpoints

1. **One-Time Welcome Email (`src/app/auth/callback/route.js`)**
   - Triggered on first Google OAuth sign-in when `public.users.welcome_email_sent === false`.
   - Marks `welcome_email_sent = true` after Resend accepts the message (`supabase/email.sql`).
   - Explains the auto-enrolled monthly Free Plan (`3 image edits/day` + `1 AI post per platform/day`).

2. **Billing & Subscription Lifecycle (`src/app/api/billing/webhook/route.js`)**
   - `subscription.active`: Sends `sendPlanUpgradedEmail` with Pro/Advanced daily limits, watermark perks, and next renewal date.
   - `subscription.renewed`: Sends `sendSubscriptionRenewedEmail` confirming monthly renewal.
   - `subscription.on_hold` / `subscription.failed` / `subscription.expired`: Sends `sendPaymentIssueEmail` with direct `/settings` link to manage or re-subscribe.
   - Recipient email is resolved from Dodo payload (`data.customer.email`) with fallback to `public.users.email`.

3. **Direct Contact Form (`src/app/api/contact/route.js` & `src/components/ContactForm.js`)**
   - Embedded on `/contact` (`src/app/contact/page.js`).
   - Includes input validation and a hidden honeypot field (`website`) against spam bots.
   - Sends inquiry to `SUPPORT_EMAIL` (`reply_to` set to sender's email) and sends an instant confirmation copy to the user.

---

## Environment Variables
- `RESEND_API_KEY`: Resend API key (`re_...`).
- `EMAIL_FROM`: Sender address (defaults to `MakeAPost <onboarding@resend.dev>` until `makeapost.site` domain DNS is verified in Resend; then set to `MakeAPost <hello@makeapost.site>`).
- `SUPPORT_EMAIL` (or `CONTACT_TO_EMAIL`): Founder/support inbox for `/contact` submissions (defaults to `adarshmishra70931@gmail.com`).
