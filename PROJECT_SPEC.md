# PROJECT_SPEC.md — MakeAPost (Single Source of Truth)

## 1. Brand Identity & Core Concept
- **Product Name:** MakeAPost
- **Tagline:** Turn raw screenshots into viral social posts in seconds.
- **Core Problem Solved:** Eliminates switching between screenshot beautifiers (Shots.so/Canva) and AI writers (ChatGPT) by combining an always-visible **70% Main Visual Canvas** with a **30% Dynamic Control Sidebar** (1-click toggle between Image Beautifier and Multimodal AI Social Studio).
- **Privacy & Architecture Rule:** 100% Stateless content generation. **NO chat history, NO post history, and NO user images are ever stored in any database.**

---

## 2. Workspace Layout Architecture (30% Sidebar / 70% Canvas)
The `/editor` studio workspace operates on a strict **30/70 Neobrutalist Split-Screen Layout**:

### Right Panel (70% Width) — Main Visual Canvas & Dropzone
- **Always Visible:** Remains permanently visible across all modes so users never lose sight of their visual context.
- **Image Dropzone & Ingestion:** Supports `Ctrl+V` clipboard paste from anywhere on the screen, file drag-and-drop, or browse button.
- **Native HTML5 Canvas Engine:** 100% client-side rendering with instant feedback for background gradients, padding, corner radius, drop shadows, aspect ratios (`16:9`, `4:3`, `1:1`, `9:16`), and interactive redaction/blur boxes.
- **Export Toolbar:** Instant client-side PNG export (`canvas.toBlob`), clipboard copy, and zoom controls.

### Left Panel (30% Width) — Dynamic Mode Panel
The 30% control sidebar features two distinct UI states:
1. **Initial Fresh State (Mode Selection):**
   - Renders two large, tactile Neobrutalist action cards:
     - **"1. Image Editor"**: Beautify screenshots, add gradient frames, adjust device mockups, and blur sensitive API keys.
     - **"2. AI Post Mode"**: Analyze visual content and generate tailored X threads, LinkedIn carousels/posts, and Reddit discussions.
2. **Active Workspace State (Sticky Switcher + Contextual Controls):**
   - **Sticky Mode Switcher Pill:** Anchored at the top of the sidebar: `[ 🎨 Editor | ✨ AI Mode ]` with the active mode highlighted in `#FFD93D` for instant 1-click toggling.
   - **Contextual Control Body:** Below the switcher, only the active mode's controls are rendered:
     - *In Image Editor Mode:* Frame controls, aspect ratios, preset gradients, padding slider, and blur tool toggle.
     - *In AI Post Mode:* Target platform tabs (`𝕏 X`, `💼 LinkedIn`, `👾 Reddit`), optional custom context/prompt input, single-shot generation CTA, and formatted post preview cards with character counters & copy buttons.

---

## 3. Tech Stack (Lightweight Next.js Architecture)
- **Framework:** Next.js (App Router, JavaScript — minimal dependencies for ultra-fast load).
- **Styling:** Vanilla CSS / CSS Modules (`src/app/globals.css` + modular CSS) implementing strict Neobrutalism tokens (avoid heavy UI component libraries).
- **Icons:** Inline SVGs / Lucide Icons (tree-shaken, lightweight).
- **Image Engine:** Native HTML5 `<canvas>` API (100% client-side rendering, annotations, blur, & PNG export).
- **Backend / API Routes:** Next.js Route Handlers (`src/app/api/generate/route.js`).
- **AI Model:** Google Gemini Flash / Flash-Lite via `@google/generative-ai` (Multimodal Vision + Single-Shot JSON output).
- **Auth & Database (Minimal):** Supabase (Google Auth + 1 single `users` table for 3-day trial & daily credit tracking only).
- **Deployment:** Vercel (`*.vercel.app` subdomain).

---

## 4. UI Design System — Neobrutalism (Tactile Flat)
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
<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MakeAPost Logo">
  <rect x="6" y="6" width="34" height="34" rx="8" fill="#09090B"/>
  <rect x="3" y="3" width="34" height="34" rx="8" fill="#FFD93D" stroke="#09090B" stroke-width="2.5"/>
  <path d="M11 15V11H15M25 11H29V15M29 25V29H25M15 29H11V25" stroke="#09090B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 14L21.5 18.5L26 20L21.5 21.5L20 26L18.5 21.5L14 20L18.5 18.5L20 14Z" fill="#09090B"/>
</svg>
```

---

## 5. Monetization, Trial & Token Optimization Rules
- **Image Editor (70% Canvas + 30% Editor Sidebar):** 100% Free & Unlimited (works client-side without login).
- **3-Day Free Trial (New Google Signups for AI Mode):** No credit card required. 5 AI post generations / day for 72 hours.
- **Monthly Pro Plan:** Daily credit cap (40 AI post generations / day, resets every 24 hours).
- **Token Optimization:**
  - Resize/compress canvas image client-side to max 768px width JPEG (0.7 quality) before sending to `/api/generate`.
  - Single-shot structured JSON response returning `x_post`, `linkedin_post`, and `reddit_post` in one API call.

---

## 6. Next.js Folder Structure & Mandatory Self-Documentation Rule
```text
/
├── src/
│   ├── app/
│   │   ├── layout.js               # Root layout with Space Grotesk, Inter, JetBrains Mono fonts & metadata
│   │   ├── globals.css             # Global Neobrutalism CSS variables, borders, hard shadows, button utilities
│   │   ├── page.js                 # Neobrutalist Landing Page with 30/70 preview showcase
│   │   ├── page.module.css         # Landing page styles
│   │   ├── editor/
│   │   │   ├── page.js             # 30/70 Studio Workspace (/editor)
│   │   │   └── editor.module.css   # 30/70 workspace layout styles
│   │   └── api/
│   │       └── generate/
│   │           └── route.js        # Serverless Gemini Vision API + Supabase credit verification
│   ├── components/
│   │   ├── Logo.js                 # Reusable MakeAPost SVG Logo + Brand Wordmark
│   │   ├── ModeSidebar.js          # 30% Dynamic Control Sidebar (Initial Selection Cards, Sticky Mode Switcher Pill [🎨 Editor | ✨ AI Mode], controls)
│   │   ├── CanvasWorkspace.js      # 70% Main Visual Canvas & Dropzone (HTML5 Canvas, Ctrl+V, annotations, blur, PNG export)
│   │   └── AiStudio.js             # AI Post Generation sub-view inside 30% sidebar
│   └── lib/
│       ├── imageCompress.js        # Client-side 768px JPEG compression utility
│       └── supabase.js             # Supabase client & credit/trial helper
├── docs/                           # MANDATORY feature & architecture documentation
│   ├── 01-landing-page.md
│   ├── 02-canvas-editor.md
│   ├── 03-ai-generator.md
│   └── 04-auth-credits.md
└── PROJECT_SPEC.md                 # Master spec (must be updated on every change)
```

### ⚠️ STRICT AGENT PROTOCOL (FOR ANTIGRAVITY)
1. **Read First:** Always read `PROJECT_SPEC.md` before writing or modifying any code.
2. **Design Fidelity:** Strictly use variables from `src/app/globals.css`. Never introduce soft blurred shadows, gradients on UI cards, or off-brand colors.
3. **Self-Documentation Rule:** Every time a feature, page, or component is created or modified:
   - Create or update its corresponding `.md` file inside `/docs/` explaining the component structure, props/functions, CSS classes, and logic.
   - Update the Current Build Status section below in `PROJECT_SPEC.md`.

---

## 7. Current Build Status
[x] Phase 1: Next.js Setup, Neobrutalism Design System (globals.css, Logo.js), Landing Page with 30/70 Studio Preview (src/app/page.js, docs/01-landing-page.md)

[x] Phase 2: 30/70 Studio Workspace Architecture & 70% Canvas Visual Engine (src/app/editor/page.js, CanvasEditor.js, ModeSidebar.js, docs/02-canvas-editor.md)

[ ] Phase 3: Image Compression & Gemini Multimodal Single-Shot API (imageCompress.js, src/app/api/generate/route.js, docs/03-ai-generator.md)

[ ] Phase 4: AI Social Studio Mode in 30% Sidebar & Live Post Previews (AiStudio.js, docs/03-ai-generator.md)

[ ] Phase 5: Supabase Auth & 3-Day Trial / Daily Credit Tracker (docs/04-auth-credits.md)
