# 07 — Legal Pages, Footer System & OAuth Compliance

This document details MakeAPost's comprehensive legal architecture, shared design system styling, data deletion mechanisms, and compliance guarantees required for OAuth 2.0 developer verification (Google, X, LinkedIn, Reddit) and payment processors.

---

## 1. Overview & Architecture

MakeAPost operates on a **Privacy-First Zero-Storage Architecture**:
1. **Zero Screenshot / Post Storage:** User screenshots and generated social copy are processed transiently in browser memory (HTML5 Canvas) and never persisted to any database or object storage.
2. **Transient AI Processing:** When generating post copy, compressed image representations are sent directly to Google Gemini 2.5 Flash via our stateless serverless route (`/api/generate`) and immediately discarded post-generation.
3. **Encrypted Authentication:** User identity (Google OAuth) is handled via Supabase Auth with Row-Level Security (RLS). Cross-device preferences (such as Dark/Light theme) are stored in the PostgreSQL `public.users` table.
4. **Creator IP Ownership:** Users retain 100% exclusive copyright and commercial ownership over all screenshots uploaded, modified, and social post copy generated.

To satisfy external platform audit requirements (e.g. Twitter/X Developer Portal, LinkedIn Developer Portal, Reddit Developer Portal, Google Cloud OAuth Verification), all legal terms, privacy policies, refund terms, and founder contact avenues are publicly accessible and integrated site-wide.

---

## 2. Reusable Multi-Column Footer (`src/components/Footer.js`)

The `Footer` component provides consistent brand anchoring and legal navigation across all core application routes.

### Visual Styling (`src/components/Footer.module.css`)
- **Tokens Used:**
  - `var(--surface)` for card-like container background.
  - `var(--border)` (2.5px solid) for sharp neobrutalist borders.
  - `var(--shadow-card)` (`4px 4px 0px var(--shadow-color)`) for hard tactile elevation.
  - Responsive layout: 3-column desktop grid collapsing into stacked cards on mobile (`< 768px`).
- **Footer Columns:**
  1. **Brand & Mission:** Logo, tagline (*"Turn raw screenshots into viral social posts in seconds."*), and real-time status badge (*"Zero Post History Stored"*).
  2. **Product Navigation:** Studio Editor (`/editor`), Account Settings (`/settings`), and Home (`/`).
  3. **Legal & Compliance:**
     - Privacy Policy (`/privacy`)
     - Terms of Service (`/terms`)
     - Refund & Cancellation (`/refund`)
     - Contact & Data Deletion (`/contact`)
  4. **Trust Badges & Attribution:**
     - Trust badges: *Google OAuth Verified*, *AES-256 Encrypted*, *Zero Cloud Storage*.
     - Bottom attribution: `© 2026 MakeAPost • Built by Adarsh Jayprakash Mishra • Zero Post History Stored`.

### Mounted Locations:
- Landing Page (`src/app/page.js`)
- Account Settings (`src/app/settings/page.js`)
- Privacy Policy (`src/app/privacy/page.js`)
- Terms of Service (`src/app/terms/page.js`)
- Refund Policy (`src/app/refund/page.js`)
- Contact & Data Deletion (`src/app/contact/page.js`)

---

## 3. Dedicated Legal Routes & Pages

All legal routes utilize a shared, high-readability Neobrutalist layout defined in `src/app/legal.module.css`.

### 3.1. Shared Legal Styling (`src/app/legal.module.css`)
- **`.legalContainer`:** Full-width viewport container honoring `--bg-primary` and theme transitions.
- **`.legalHeader`:** Sticky top header with MakeAPost `Logo` and quick navigation buttons (`Home`, `Studio`).
- **`.mainContent`:** Centered content container (`max-width: 860px`) with generous vertical spacing.
- **`.sectionCard`:** Neobrutalist article card with `var(--border)`, `var(--shadow-card)`, and numbered step badges.
- **`.callout`:** Prominent highlight box with yellow border accent for critical compliance disclosures.

---

### 3.2. Privacy Policy (`/privacy`) — `src/app/privacy/page.js`
Covers all regulatory disclosures under GDPR, CCPA, and AI platform transparency guidelines:
- **Zero-Storage Architecture:** Clear legal statement affirming that images and generated text are never stored in databases or log files.
- **Stateless AI Processing:** Disclosures regarding Google Gemini 2.5 Flash API transmission, verifying that image bytes are processed ephemerally and not used for model training without explicit consent.
- **Supabase Account Records:** Detailed enumeration of database columns collected (`id`, `email`, `full_name`, `avatar_url`, `theme`, `created_at`).
- **Social OAuth Security:** Disclosures regarding X, LinkedIn, and Reddit OAuth tokens, stating they are stored encrypted (AES-256-GCM), used only upon explicit user action, and never shared or sold.
- **Data Subject Rights:** Full breakdown of rights to access, rectification, and deletion under GDPR Article 17.

---

### 3.3. Terms of Service (`/terms`) — `src/app/terms/page.js`
Defines the contractual agreement governing use of MakeAPost:
- **100% User Ownership:** Explicit intellectual property clause ensuring creators retain 100% ownership, copyright, and commercial exploitation rights to their images and generated posts.
- **Acceptable Use Policy:** Prohibition against uploading defamatory, illegal, malicious, or rights-infringing material.
- **Platform Rules Compliance:** Requirement that users abide by third-party terms of service when publishing content to X, LinkedIn, and Reddit.
- **Service Availability & Disclaimers:** Standard "AS IS" disclaimers regarding viral performance and marketing metrics.

---

### 3.4. Refund & Cancellation Policy (`/refund`) — `src/app/refund/page.js`
Provides clear financial policies required by Stripe, LemonSqueezy, and merchant processors:
- **Current Access Model:** Discloses 100% free unlimited access during beta and trial periods without requiring a credit card upfront.
- **Subscription Cancellation:** Details one-click cancellation from `/settings` effective at the end of the active billing cycle.
- **14-Day Refund Guarantee:** Full refund window for technical downtime, accidental duplicate charges, or unsatisfied subscribers within 14 days of billing.
- **Direct Support Dispute Resolution:** Official billing resolution contact (`support@makeapost.app` / `adarshmishra70931@gmail.com`).

---

### 3.5. Contact & Data Deletion (`/contact`) — `src/app/contact/page.js`
Fulfills OAuth provider mandatory data deletion callback / instruction URLs:
- **Founder Attribution:** Complete ownership attribution to **Adarsh Jayprakash Mishra**.
- **Support Channels:** Verified contact emails (`support@makeapost.app` and `adarshmishra70931@gmail.com`) with sub-24-hour SLA.
- **Step 1: Provider OAuth Revocation:** Step-by-step URLs and instructions for disconnecting MakeAPost from Google Account Permissions, X Connected Apps, LinkedIn Permitted Services, and Reddit Third-Party Authorizations.
- **Step 2: Instant Token Purge:** Instructions for clicking "Disconnect" in `/settings` to purge OAuth access tokens from Supabase.
- **Step 3: Complete Account & Data Erasure:** 48-hour SLA deletion request process via email for permanent removal from the Supabase PostgreSQL cluster.

---

## 4. OAuth Developer Portal URL Configuration Reference

When submitting MakeAPost for verification on developer portals, use the following standardized URLs:

| Field | Production URL |
| :--- | :--- |
| **Homepage URL** | `https://makeapost.app/` |
| **Privacy Policy URL** | `https://makeapost.app/privacy` |
| **Terms of Service URL** | `https://makeapost.app/terms` |
| **Data Deletion URL / Instructions** | `https://makeapost.app/contact` |
| **Support Email** | `support@makeapost.app` / `adarshmishra70931@gmail.com` |
| **OAuth Callback URL** | `https://makeapost.app/auth/callback` |

---

## 5. Mandatory Maintenance Protocol

> **Legal Sync Rule:**
> Whenever a new third-party integration, OAuth provider, AI model (e.g. Claude, OpenAI), or payment processor (e.g. Stripe, LemonSqueezy) is added or modified, the agent MUST automatically update the corresponding legal pages (`/privacy`, `/terms`, `/refund`, or `/contact`) and update this document to maintain strict legal compliance.
