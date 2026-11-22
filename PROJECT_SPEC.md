# PROJECT_SPEC.md — MakeAPost (Single Source of Truth)

## 1. Brand Identity & Core Concept
- **Product Name:** MakeAPost
- **Tagline:** Turn raw screenshots into viral social posts in seconds.
- **Core Problem Solved:** Eliminates switching between screenshot beautifiers (Shots.so/Canva) and AI writers (ChatGPT) by combining a fast browser-based image editor and a multimodal AI social post generator in a single 2-panel studio.
- **Privacy & Architecture Rule:** 100% Stateless content generation. **NO chat history, NO post history, and NO user images are ever stored in any database.**

## 2. Tech Stack (Lightweight Next.js Architecture)
- **Framework:** Next.js (App Router, JavaScript or TypeScript — keep dependencies minimal for ultra-fast load).
- **Styling:** Vanilla CSS / CSS Modules (`src/app/globals.css` + modular CSS) implementing strict Neobrutalism tokens (avoid heavy UI component libraries).
- **Icons:** Inline SVGs / Lucide Icons (tree-shaken, lightweight).
- **Image Engine:** Native HTML5 `<canvas>` API (100% client-side rendering, annotations, blur, & PNG export).
- **Backend / API Routes:** Next.js Route Handlers (`src/app/api/generate/route.js`).
- **AI Model:** Google Gemini Flash / Flash-Lite via `@google/generative-ai` (Multimodal Vision + Single-Shot JSON output).
- **Auth & Database (Minimal):** Supabase (Google Auth + 1 single `users` table for 3-day trial & daily credit tracking only).
- **Deployment:** Vercel (initial deployment on `*.vercel.app` subdomain).

## 3. UI Design System — Neobrutalism (Tactile Flat)
- **Background Primary:** `#F8FAFC` (Crisp Off-White)
- **Surface / Cards:** `#FFFFFF` (Pure White)
- **Primary Accent:** `#FFD93D` (Vibrant Yellow — Primary CTAs, Logo, Highlights)
- **Secondary Accent:** `#38BDF8` (Electric Sky Blue — Active tabs, Badges)
- **Ink / Borders / Text:** `#09090B` (Deep Obsidian Black)
- **Muted Text:** `#475569` (Slate Grey)
- **Borders:** `2.5px solid #09090B` on all buttons, cards, inputs, and containers.
- **Hard Offset Shadows:** `4px 4px 0px #09090B` on cards/containers; `3px 3px 0px #09090B` on buttons (shifts to `1px 1px 0px` on `:active` click).
- **Typography:** Google Fonts via `next/font/google` — `'Space Grotesk'` (Headings, bold/extrabold), `'Inter'` (Body), `'JetBrains Mono'` (Badges/Counters).
- **Official SVG Logo (`MakeAPostLogo` component):**
```svg
<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" aria-label="MakeAPost Logo">
  <rect x="6" y="6" width="34" height="34" rx="8" fill="#09090B"/>
  <rect x="3" y="3" width="34" height="34" rx="8" fill="#FFD93D" stroke="#09090B" stroke-width="2.5"/>
  <path d="M11 15V11H15M25 11H29V15M29 25V29H25M15 29H11V25" stroke="#09090B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 14L21.5 18.5L26 20L21.5 21.5L20 26L18.5 21.5L14 20L18.5 18.5L20 14Z" fill="#09090B"/>
</svg>
4. Monetization, Trial & Token Optimization Rules
Left Panel (Image Editor): 100% Free & Unlimited (works client-side without login).

3-Day Free Trial (New Google Signups): No credit card required. 5 AI post generations / day for 72 hours.

Monthly Pro Plan: Daily credit cap (40 AI post generations / day, resets every 24 hours).

Token Optimization:

Resize/compress canvas image client-side to max 768px width JPEG (0.7 quality) before sending to /api/generate.

Single-shot structured JSON response returning x_post, linkedin_post, and reddit_post in one API call.

5. Next.js Folder Structure & Mandatory Self-Documentation Rule
Plaintext
/
├── src/
│   ├── app/
│   │   ├── layout.js               # Root layout with Space Grotesk, Inter, JetBrains Mono fonts & metadata
│   │   ├── globals.css             # Global Neobrutalism CSS variables, borders, hard shadows, button utilities
│   │   ├── page.js                 # Neobrutalist Landing Page (/)
│   │   ├── page.module.css         # Landing page styles
│   │   ├── editor/
│   │   │   ├── page.js             # 2-Panel Studio (/editor)
│   │   │   └── editor.module.css   # 2-panel workspace styles
│   │   └── api/
│   │       └── generate/
│   │           └── route.js        # Serverless Gemini Vision API + Supabase credit verification
│   ├── components/
│   │   ├── Logo.js                 # Reusable MakeAPost SVG Logo + Brand Wordmark
│   │   ├── CanvasEditor.js         # Client component: HTML5 Canvas rendering, Ctrl+V paste, tools, PNG export
│   │   └── AiStudio.js             # Client component: Platform tabs, prompt box, live post preview cards
│   └── lib/
│       ├── imageCompress.js        # Client-side 768px JPEG compression utility
│       └── supabase.js             # Supabase client & credit/trial helper
├── docs/                           # MANDATORY feature & architecture documentation
│   ├── 01-landing-page.md
│   ├── 02-canvas-editor.md
│   ├── 03-ai-generator.md
│   └── 04-auth-credits.md
└── PROJECT_SPEC.md                 # Master spec (must be updated on every change)
⚠️ STRICT AGENT PROTOCOL (FOR ANTIGRAVITY)
Read First: Always read PROJECT_SPEC.md before writing or modifying any code.

Design Fidelity: Strictly use variables from src/app/globals.css. Never introduce soft blurred shadows, gradients on UI cards, or off-brand colors.

Self-Documentation Rule: Every time a feature, page, or component is created or modified:

Create or update its corresponding .md file inside /docs/ explaining the component structure, props/functions, CSS classes, and logic.

Update the Current Build Status section below in PROJECT_SPEC.md.

6. Current Build Status
[x] Phase 1: Next.js Setup, Neobrutalism Design System (globals.css, Logo.js), & Landing Page (src/app/page.js, docs/01-landing-page.md)

[ ] Phase 2: 2-Panel Studio Shell & Left Canvas Image Editor (src/app/editor/page.js, CanvasEditor.js, docs/02-canvas-editor.md)

[ ] Phase 3: Image Compression & Gemini Single-Shot JSON API (imageCompress.js, src/app/api/generate/route.js, docs/03-ai-generator.md)

[ ] Phase 4: Right Panel AI Social Studio & Live Post Previews (AiStudio.js)

[ ] Phase 5: Supabase Auth & 3-Day Trial / Daily Credit Tracker (docs/04-auth-credits.md)