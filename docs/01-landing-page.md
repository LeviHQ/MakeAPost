# MakeAPost — Conversion-Ready Landing Page (`src/app/page.js`)

> Documentation for the Neobrutalist conversion landing page (`https://makeapost.site`), interactive live output preview, Before/After visual split, comparison cards, and FAQ accordion.

---

## 1. Architecture & Components
- **`src/app/page.js`:** Server component rendering the conversion-focused landing flow (without a pricing section, which will be added later alongside billing).
- **`src/components/LandingNavbar.js`:** Sticky Neobrutalist top navigation bar featuring:
  - Brand logo + `"ZERO POST HISTORY"` pill badge.
  - Anchor links (`#problem`, `#features`, `#preview`, `#faq`).
  - `ThemeToggle` for instant Dark/Light mode switching.
  - Dynamic auth CTAs (`Sign In` + `Launch Studio Free` when logged out; `Settings` + `Open Studio` when logged in).
  - Mobile overlay hamburger menu (`position: absolute; top: 100%`) with zero layout shift.
- **`src/components/LandingLivePreview.js`:** Interactive client widget allowing visitors to toggle between 3 creator use cases (`Code / Build in Public`, `Client Win`, `Learning Note`) and 3 platform tabs (`X`, `LinkedIn`, `Reddit`) to inspect framed canvas mockups alongside tailored AI post copy.
- **`src/components/LandingFaq.js`:** 4-question accessible Neobrutalist accordion covering 1-click native intent posting, zero-storage privacy, 3-day free trial details, and supported platforms.
- **`src/components/Footer.js`:** Reusable footer linking `/privacy`, `/terms`, `/refund`, and `/contact`.

---

## 2. Page Sections
1. **Hero Section & Before/After Split (`#before-after`):** Addresses the raw-screenshot pain point with `"Try MakeAPost Free — No Card Needed"` CTA and a side-by-side Before vs. After visual comparison.
2. **Why MakeAPost? (`#problem`):** Compares *The Old 4-Tab Headache* (~15 mins/post) against *The MakeAPost 1-Tab Flow* (~10 seconds).
3. **All-in-One Feature Grid (`#features`):** 6 Neobrutalist cards covering Instant Canvas Framing, Context-Aware AI Copywriter, 1-Click Clipboard PNG + Native Intent, 100% Zero Post History Stored, Built for Every Creator Moment, and 3-Day Free Trial.
4. **Interactive Live Output Preview (`#preview`):** Real-time Use Case × Platform switcher.
5. **FAQ Accordion (`#faq`) & Final CTA:** Answers key trust/workflow questions before linking into `/editor`.

---

## 3. Domain & SEO Metadata (`src/app/layout.js`)
- `getBaseUrl()` resolves `process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ... || 'https://makeapost.site'`.
- `alternates: { canonical: '/' }` is configured in `metadata`.
