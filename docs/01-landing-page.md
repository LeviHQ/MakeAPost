# Documentation: Phase 1 — Landing Page & Neobrutalism Design System (30/70 Workspace Update)

## 1. Overview
Phase 1 establishes the core foundation of **MakeAPost**, including the lightweight Next.js App Router initialization, the strict Neobrutalism Design System tokens, the official SVG logo component, and the high-converting landing page showcasing the **30/70 Split-Screen Workspace Architecture**.

---

## 2. Refined 30/70 Workspace Layout Architecture
The studio workspace (`/editor`) and its landing page showcase feature a **30% Dynamic Control Sidebar** paired with an always-visible **70% Main Visual Canvas**:

```text
┌───────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│  Left 30% Dynamic Control Sidebar         │  Right 70% Main Visual Canvas & Dropzone               │
│                                           │                                                        │
│  [Sticky Pill: 🎨 Editor | ✨ AI Mode]    │  • Always Visible in both modes                        │
│                                           │  • Global Ctrl+V clipboard paste & drag-drop           │
│  1. Initial Fresh State:                  │  • Real-time HTML5 Canvas rendering                    │
│     - Card A: 1. Image Editor             │  • Gradient frames, padding, aspect ratio, blur boxes   │
│     - Card B: 2. AI Post Mode             │  • HD PNG export & clipboard image copy                │
│                                           │                                                        │
│  2. Active Workspace State:               │                                                        │
│     - Contextual controls for active mode │                                                        │
│     - Editor: Gradients, Aspect, Blur     │                                                        │
│     - AI Mode: X, LinkedIn, Reddit tabs   │                                                        │
└───────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### Right Panel (`70%` width) — Main Visual Canvas
- **Persistent Visibility:** Users never lose visual context. Whether adjusting image padding or generating social posts, the canvas remains permanently in view.
- **Dropzone & Input:** Ingests images via `Ctrl+V` anywhere on the screen or drag-and-drop.
- **HTML5 Canvas Engine:** Client-side rendering for frames, shadows, aspect ratios (`16:9`, `4:3`, `1:1`, `9:16`), sensitive credential redaction, and PNG export.

### Left Panel (`30%` width) — Dynamic Mode Panel
1. **Initial Fresh State:** Two tactile Neobrutalist cards:
   - **"1. Image Editor"**: Beautify, add gradient frames, adjust device mockups, and blur sensitive tokens.
   - **"2. AI Post Mode"**: Multimodal single-shot social generator for X, LinkedIn, and Reddit.
2. **Active Workspace State:**
   - **Sticky Mode Switcher Pill:** `[ 🎨 Editor | ✨ AI Mode ]` anchored to the top with the active tab in `#FFD93D`.
   - **Contextual Controls:** Renders only the configuration tools needed for the chosen mode.

---

## 3. File Structure
```text
MakeAPost/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout with Google Fonts (Space Grotesk, Inter, JetBrains Mono) & SEO metadata
│   │   ├── globals.css        # Master Neobrutalism design tokens, variables, & tactile button utilities
│   │   ├── page.js            # Landing page showcasing the 30/70 studio preview
│   │   ├── page.module.css    # Scoped Neobrutalist 30/70 preview grid styles
│   │   └── editor/
│   │       └── page.js        # Editor 30/70 studio workspace shell (Phase 2 entry point)
│   └── components/
│       └── Logo.js            # Reusable SVG logo & brand wordmark component
├── docs/
│   └── 01-landing-page.md     # Feature and architecture documentation
├── jsconfig.json              # Path aliases (@/* -> ./src/*)
├── next.config.mjs            # Next.js configuration
└── package.json               # Next.js 15, React 19, Lucide-react
```

---

## 4. Design System & CSS Tokens (`src/app/globals.css`)
Strict Neobrutalism rules are defined using standard CSS variables:

### Color Palette
- `--bg-primary: #F8FAFC;` — Crisp Off-White background.
- `--surface: #FFFFFF;` — Pure White for cards and containers.
- `--accent-yellow: #FFD93D;` — Vibrant Yellow (Primary CTA, logo highlight, active switcher pill).
- `--accent-blue: #38BDF8;` — Electric Sky Blue (Secondary tags, active aspect ratio pills).
- `--accent-green: #4ADE80;` — Accent Green (Status indicators, live badges).
- `--ink: #09090B;` — Deep Obsidian Black (Borders, typography, hard shadows).
- `--muted: #475569;` — Slate Grey for body descriptions and subtext.

### Borders & Shadows
- `--border: 2.5px solid #09090B;` — Applied across cards, buttons, badges, and containers.
- `--border-thick: 3px solid #09090B;` — Applied to hero CTAs and showcase window containers.
- `--shadow-card: 4px 4px 0px #09090B;` — Hard offset card shadow.
- `--shadow-btn: 3px 3px 0px #09090B;` — Tactile button shadow.
- `--shadow-btn-hover: 4px 4px 0px #09090B;` — Hover offset.
- `--shadow-btn-active: 1px 1px 0px #09090B;` — Pressed state (tactile depression effect).

### Typography
- Headings: `Space Grotesk`
- Body: `Inter`
- Mono & Badges: `JetBrains Mono`

---

## 5. Components

### `Logo.js` (`src/components/Logo.js`)
- Renders the official MakeAPost SVG logo with double-layered Neobrutalist rectangles and central spark paths.
- Accompanied by the brand wordmark `Make[A]Post`.

---

## 6. Landing Page Structure (`src/app/page.js` & `src/app/page.module.css`)

### 1. Sticky Navbar
- Logo component on the left.
- Badge: `⚡ 30% Sidebar + 70% Canvas` + tactile button `Go to Editor →` linking to `/editor`.

### 2. Hero Section
- **Badge:** `✨ 30/70 SPLIT WORKSPACE: CANVAS + MULTIMODAL AI`
- **Headline:** `INCREASE REACH OF YOUR SCREENSHOTS` with yellow Neobrutalist highlight box on `SCREENSHOTS`.
- **Subheadline:** "Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen."
- **Primary CTA:** Tactile button `Go to Editor →`.
- **Micro-copy:** "3-day free trial • No card required • Free unlimited image editor".

### 3. Interactive-Feel 30/70 Split Preview Showcase
- **Left 30% Sidebar (`.sidebar30`):**
  - Sticky Neobrutalist mode switcher pill (`🎨 Editor` active in `#FFD93D` | `✨ AI Mode`).
  - Active configuration card: Aspect ratio pills (`16:9`, `4:3`, `1:1`, `9:16`), background gradient presets with active ring, and `🔒 Blur Credentials` toggle.
  - Explanatory note describing the Initial Fresh State vs Active State.
- **Right 70% Canvas (`.canvas70`):**
  - Dropzone indicator: `✦ Drop / Paste Screenshot [Ctrl+V]`.
  - Vibrant gradient canvas stage framing a mock code screenshot (`make-a-post-studio.js`) with an active credential blur highlight.
  - Floating viral social post result card previewing instant X post generation.
  - Bottom action bar with HD canvas specs and `Export PNG 📥` button.

### 4. 3-Step How It Works Strip
1. `01. Paste on 70% Canvas (Ctrl+V)`: Clipboard paste, zero upload lag, offline-ready.
2. `02. Beautify & Blur in 30% Sidebar`: Gradients, aspect ratio frames, client-side blurring.
3. `03. Switch to AI Mode & Post`: 1-click switch via sticky pill to generate viral platform posts.

### 5. Privacy Guarantee Strip
Highlights stateless, zero-image-storage architecture.

### 6. Minimal Footer
Branding and quick links.
