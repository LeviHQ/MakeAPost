# 11. SEO, GEO, AEO & ASO Architecture

## Overview
MakeAPost (`https://makeapost.site`) implements a unified Search Engine Optimization (SEO), Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), and App Store / PWA Optimization (ASO) layer.

---

## 1. Technical SEO & Crawlability
- **`src/app/sitemap.js`:** Dynamically outputs `/sitemap.xml` covering `/`, `/editor`, `/blog`, `/about`, `/founder`, `/contact`, `/privacy`, `/terms`, `/refund`, all 5 `/alternatives/[slug]` pages, and all 30 `/blog/[slug]` articles.
- **`src/app/robots.js`:** Outputs `/robots.txt` allowing public pages and major AI crawlers (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`) while disallowing `/api/`, `/auth/`, and `/settings`.
- **`src/app/layout.js`, `src/app/editor/layout.js`, `src/app/settings/layout.js`:** `title.template` (`%s | MakeAPost`), canonicals, OpenGraph/Twitter cards (`@AdarshMi18`), and `noindex, nofollow` on private `/settings`.

## 2. GEO & AEO (AI Visibility & Answer Engines)
- **Static Machine-Readable Endpoints (`public/`):**
  - `/llms.txt` — Concise LLM index & product summary
  - `/llms-full.txt` — Complete technical & product specification
  - `/ai.txt` — AI crawler permissions & endpoint directory
  - `/ai-snapshot.json` — Structured JSON entity snapshot
  - `/openapi.json` — OpenAPI 3.1 overview of public/studio routes
- **JSON-LD Structured Data:**
  - `src/app/page.js`: `Organization`, `SoftwareApplication` (with Free/Pro/Advanced `Offer`s), and `FAQPage`.
  - `src/app/founder/page.js`: `Person` schema with verified social `sameAs` links.
  - `src/app/alternatives/[slug]/page.js`: `BreadcrumbList` + `FAQPage` + Direct AEO Answer summary.
  - `src/app/blog/page.js` & `src/app/blog/[slug]/page.js`: `Blog`, `Article`, `BreadcrumbList`, `FAQPage`, and TL;DR Direct Answer box.
- **Footer AI Visibility Strip (`src/components/Footer.js`):**
  - **Ask AI About MakeAPost:** 1-click verified query buttons for ChatGPT, Claude, Perplexity, Gemini, Copilot, Grok, and DeepSeek.
  - **For AI Agents & Crawlers:** Direct links to `/llms.txt`, `/llms-full.txt`, `/ai.txt`, `/ai-snapshot.json`, `/openapi.json`, `/sitemap.xml`, and `/robots.txt`.

## 3. ASO (PWA App Optimization)
- **`src/app/manifest.js`:** Enhanced Web App Manifest with `id`, `scope`, `categories` (`productivity`, `social`, `utilities`, `design`), `shortcuts` (`Open Studio`, `Pricing`, `Settings`), and maskable icons.

## 4. Content Hubs
- **5 Competitor Alternatives (`/alternatives/[slug]`):** `shots-so`, `carbon`, `ray-so`, `canva`, `buffer-typefully` (`src/lib/alternativesData.js`).
- **30 Creator Guides (`/blog` & `/blog/[slug]`):** 30 statically generated articles across Screenshot Design, AI Social Growth, Build in Public, Privacy & Security, and Creator Workflows (`src/lib/blogData.js`).
