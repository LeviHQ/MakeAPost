# Documentation: Phase 1 — Landing Page & Neobrutalism Design System

## 1. Overview
Phase 1 establishes the core foundation of **MakeAPost**, including the lightweight Next.js App Router initialization, the strict Neobrutalism Design System tokens, the official SVG logo component, and the high-converting landing page.

---

## 2. File Structure Created in Phase 1
```text
MakeAPost/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout with Google Fonts (Space Grotesk, Inter, JetBrains Mono) & SEO metadata
│   │   ├── globals.css        # Master Neobrutalism design tokens, variables, & tactile button utilities
│   │   ├── page.js            # Landing page component
│   │   ├── page.module.css    # Scoped Neobrutalist landing page styles
│   │   └── editor/
│   │       └── page.js        # Editor studio shell (Phase 2 entry point)
│   └── components/
│       └── Logo.js            # Reusable SVG logo & brand wordmark component
├── docs/
│   └── 01-landing-page.md     # Feature and architecture documentation
├── jsconfig.json              # Path aliases (@/* -> ./src/*)
├── next.config.mjs            # Next.js configuration
└── package.json               # Next.js 15, React 19, Lucide-react
```

---

## 3. Design System & CSS Tokens (`src/app/globals.css`)
Strict Neobrutalism rules are defined using standard CSS variables:

### Color Palette
- `--bg-primary: #F8FAFC;` — Crisp Off-White background.
- `--surface: #FFFFFF;` — Pure White for cards and containers.
- `--accent-yellow: #FFD93D;` — Vibrant Yellow (Primary CTA, logo highlight, badges).
- `--accent-blue: #38BDF8;` — Electric Sky Blue (Secondary tags, active states).
- `--accent-green: #4ADE80;` — Accent Green (Status indicators, live badges).
- `--ink: #09090B;` — Deep Obsidian Black (Borders, typography, drop shadows).
- `--muted: #475569;` — Slate Grey for body descriptions and subtext.

### Borders & Shadows
- `--border: 2.5px solid #09090B;` — Applied across cards, buttons, badges, and containers.
- `--border-thick: 3px solid #09090B;` — Used on primary hero CTAs and showcase containers.
- `--shadow-card: 4px 4px 0px #09090B;` — Hard offset card shadow.
- `--shadow-btn: 3px 3px 0px #09090B;` — Tactile button shadow.
- `--shadow-btn-hover: 4px 4px 0px #09090B;` — Hover offset.
- `--shadow-btn-active: 1px 1px 0px #09090B;` — Pressed state (tactile depression effect).

### Typography
- Headings: `Space Grotesk` (weights: 500, 600, 700, 800)
- Body: `Inter` (weights: 400, 500, 600, 700)
- Mono & Badges: `JetBrains Mono` (weights: 400, 500, 700)

### Tactile Button Utility (`.btn-brutal`)
Implements authentic tactile physical button physics:
```css
.btn-brutal {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-heading);
  font-weight: 700;
  border: var(--border);
  box-shadow: var(--shadow-btn);
  cursor: pointer;
  transition: transform 0.08s ease-out, box-shadow 0.08s ease-out;
}
.btn-brutal:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-btn-hover);
}
.btn-brutal:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-btn-active);
}
```

---

## 4. Components

### `Logo.js` (`src/components/Logo.js`)
- **Props:**
  - `size` (number, default: `36`): Controls icon width and height in pixels.
  - `showWordmark` (boolean, default: `true`): Renders "Make[A]Post" wordmark beside the icon.
  - `className` (string, default: `''`): Custom class for container.
- **Rendering:**
  - Uses the official MakeAPost SVG icon from `PROJECT_SPEC.md` with double-layered Neobrutalist rectangles and central spark paths.
  - Links to root (`/`).

---

## 5. Landing Page Structure (`src/app/page.js` & `src/app/page.module.css`)

### 1. Sticky Navbar
- Logo component on the left with instant link back to `/`.
- Feature badge (`⚡ 100% Client-Side Canvas`) and tactile button (`Go to Editor →`) linking to `/editor`.

### 2. Hero Section
- **Badge:** `✨ DUAL-PANEL SCREENSHOT + AI SOCIAL ENGINE`
- **Headline:** `INCREASE REACH OF YOUR SCREENSHOTS` with Neobrutalist tilted yellow highlight box on `SCREENSHOTS`.
- **Subheadline:** "Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen."
- **Primary CTA:** Oversized tactile button `Go to Editor →` linking to `/editor`.
- **Micro-copy:** "3-day free trial • No card required • Free unlimited image editor".

### 3. Interactive-Feel Static Preview Card
A dual-panel showcase container designed like a native desktop application with window controls (red, yellow, green):
- **Left Panel (Canvas Beautifier Preview):**
  - Gradient background frame with code snippet mockup (`api-route.js`).
  - Demonstrates client-side credential blurring (`[Blurred]` badge).
  - Canvas control strip showing aspect ratio selection (`16:9`), corner radius (`Round 16px`), and gradient preset color swatches.
- **Right Panel (AI Social Studio Preview):**
  - Platform selector tabs: `𝕏 X (Twitter)`, `💼 LinkedIn`, `👾 Reddit`.
  - Realistic viral social post preview card with author meta, body copy, hashtags, character counter (`234 / 280 chars`), and copy button.

### 4. 3-Step How It Works Strip
Three Neobrutalist cards highlighting the core workflow:
1. `01. Paste Screenshot (Ctrl+V)`: Clipboard paste, zero upload lag, offline-ready.
2. `02. Beautify & Highlight`: Gradients, aspect ratio frames, client-side blurring of sensitive keys.
3. `03. Generate Platform Posts`: Multimodal single-shot AI post generation tailored for X, LinkedIn, and Reddit.

### 5. Privacy Guarantee Strip
Highlights the core differentiator:
- 100% Privacy-First Architecture.
- Zero image storage in any database.
- Completely stateless multimodal AI generation.

### 6. Minimal Footer
- Brand logo + wordmark.
- "MakeAPost • Zero History Stored • 100% Privacy-First".
- Quick action button to open the editor studio.
