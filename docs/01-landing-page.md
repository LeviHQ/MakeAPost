# MakeAPost — Privacy-First Conversion Landing Page (`src/app/page.js`)

> Documentation for the Neobrutalist landing page (`https://makeapost.site`), interactive scenario × platform preview, Before/After visual split, Privacy-First Architecture section, and 5-question FAQ accordion.

---

## 1. Architecture & Components
- **`src/app/page.js`:** Server component rendering the conversion-focused landing flow (no Pricing section yet; deferred to upcoming billing milestone).
- **`src/components/LandingNavbar.js`:** Sticky Neobrutalist top navigation bar featuring:
  - Brand logo.
  - Anchor links (`#problem`, `#features`, `#privacy-architecture`, `#faq`).
  - Dynamic auth CTAs (`Sign In with Google` + `Launch Studio Free` when logged out; `Settings` + `Open Studio` when logged in). Theme switching remains centralized inside `/settings`.
  - Mobile overlay hamburger menu (`position: absolute; top: 100%`) with zero layout shift.
- **`src/components/LandingLivePreview.js`:** Interactive **Mini 30/70 Studio Demo** embedding `<CanvasEditor />` pre-loaded with a MakeAPost Business Growth dashboard SVG (no local file upload) and a left 30% sidebar with `[ Editor | AI Mode ]` toggle:
  - *Editor Mode:* Live controls for Aspect Ratio, Frame Style, Background swatches, Padding slider, 3D Tilt, and Watermark toggle.
  - *AI Mode:* Platform tabs (`X`, `LinkedIn`, `Reddit`), Tone chips, and a `"Generate Demo Post"` button returning fixed pre-written posts with zero real API calls.
- **`src/components/LandingFaq.js`:** 5-question accessible Neobrutalist accordion covering 1-click posting without passwords, zero-storage privacy, minimal stored account data, Google OAuth sign-in, and supported platforms.
- **`src/components/Footer.js`:** Reusable footer linking `/privacy`, `/terms`, `/refund`, and `/contact`.

---

## 2. Page Sections
1. **Hero Section & Before/After Split (`#before-after`):** Addresses raw-screenshot friction with `"Open Studio Free — No Card Needed"` CTA and a side-by-side Before vs. After visual comparison.
2. **Why We Built MakeAPost (`#problem`):** Contrasts *Before MakeAPost (4-Tab Friction)* against *With MakeAPost (1-Tab Flow)*.
3. **Interactive Studio & Multi-Platform Preview + 6 Core Capabilities (`#features`):** Scenario × Platform switcher plus 6 Neobrutalist capability cards.
4. **Privacy-First Architecture (`#privacy-architecture`):** Transparent side-by-side breakdown of *What We NEVER Store* vs. *What Minimal Data We Store*.
5. **FAQ Accordion (`#faq`) & Final CTA:** Answers key trust/workflow questions before linking into `/editor`.

---

## 3. Domain & SEO Metadata (`src/app/layout.js`)
- `getBaseUrl()` resolves `process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ... || 'https://makeapost.site'`.
- `alternates: { canonical: '/' }` configured across `layout.js` and legal routes (`/privacy`, `/terms`, `/refund`, `/contact`).
