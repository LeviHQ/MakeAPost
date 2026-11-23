# 06 — Design System: Vector Icons & High-Contrast Dark Mode Overhaul

## 1. Context & Problem Statement
In previous iterations, informal Unicode emojis (such as 🎨, ✨, ⚡, 🖼️, ✦) were used across the application. These caused two major issues:
1. **OS-Dependent Glyph Rendering:** Unicode emojis render inconsistently across Windows, macOS, iOS, Android, and Linux, often causing misalignments, missing glyph square boxes, or non-matching aesthetics.
2. **Dark Mode Text Invisibility & Contrast Failure:** When dark mode was enabled, CSS inheritance caused `--ink: #F4F4F5` (white text) to render over bright yellow, cyan, and pastel surfaces (`.badge-yellow`, `.headlineHighlight`, `.modeTabActive`, `.aspectBtnActive`, `.stepBadge`, `.toggleBtn`). Furthermore, `--border-color: #3F3F46` on dark background `#0B0B0E` provided only ~2.2:1 contrast, eroding the bold tactile Neobrutalist aesthetic.

---

## 2. Solution & Architectural Changes

### A. Universal Vector Icon Migration (`lucide-react` & `SocialIcons.js`)
- **Lucide React Icons:** All Unicode emojis across `/` (Landing Page) and `/editor` (Image Studio & AI Post Generator) were replaced with crisp, standardized SVG icons from `lucide-react`:
  - `ThemeToggle`: Upgraded with `<Sun size={15} />` (with `#FFD93D` accent) and `<Moon size={15} />`.
  - Navigation & Badges: `<Zap size={13} />`, `<Sparkles size={13} />`, `<ArrowRight size={14} />`.
  - Annotation Toolbar: `<MousePointer size={15} />`, `<Square size={15} />`, `<ArrowUpRight size={16} />`, `<EyeOff size={15} />`, `<Type size={15} />`, `<Trash2 size={13} />`.
  - Dropzone & Actions: `<Camera size={26} />`, `<FolderOpen size={16} />`, `<Code2 size={15} />`, `<BarChart3 size={15} />`, `<RotateCcw size={14} />`, `<Copy size={14} />`, `<Download size={14} />`, `<ShieldCheck size={28} />`.
  - AI Studio: `<Sparkles size={16} />`, `<AlertCircle size={16} />`, `<Hammer size={14} />`, `<BookOpen size={14} />`, `<ExternalLink size={12} />`, `<Globe size={11} />`.
- **Custom Brand Vector Icons (`src/components/SocialIcons.js`):**
  - High-fidelity SVG components for proprietary platform brands: `<XIcon />`, `<LinkedInIcon />`, and `<RedditIcon />` ensuring exact geometry, scalable sizing, and zero font dependencies.

### B. Neobrutalist High-Contrast Dark Mode Tokens (`globals.css`)
```css
[data-theme="dark"] {
  --bg-primary: #0B0B0E;
  --surface: #16161C;
  --card-bg-subtle: #1F1F28;
  --ink: #F4F4F5;
  --muted: #A1A1AA;
  --muted-light: #71717A;
  --border-color: #E4E4E7;      /* Crisp, high-contrast Neobrutalist borders (WCAG AAA) */
  --shadow-color: #000000;
  --dot-color: #333338;         /* Clear guide dot visibility in visual canvas */

  --accent-yellow: #FFD93D;
  --accent-blue: #38BDF8;
  --accent-green: #4ADE80;
}
```

### C. Text Color Isolation & Explicit High-Contrast Rules
To eliminate washed-out white text on bright accent surfaces in Dark Mode, all colored badges, highlight boxes, and buttons enforce deep black text (`#09090B !important`):
- `.badge-yellow`, `.badge-blue`, `.badge-green`: `color: #09090B !important;`
- `.btn-primary`, `.btn-secondary`: `color: #09090B !important;`
- `.headlineHighlight`: `background-color: var(--accent-yellow) !important; color: #09090B !important;`
- `.modeTabActive`: `background-color: var(--accent-yellow) !important; color: #09090B !important;`
- `.aspectBtnActive`: `background-color: var(--accent-blue) !important; color: #09090B !important;`
- `.stepBadge`: `background-color: var(--accent-yellow) !important; color: #09090B !important;`
- `.toggleBtn`: `background-color: var(--accent-green); color: #09090B !important; box-shadow: 2px 2px 0px var(--shadow-color);`
- Background swatches: Swatch borders now use `var(--border-color)` when inactive and `var(--accent-yellow)` when active, avoiding hardcoded light rings in dark mode.
- Annotation delete button: Replaced light pink `#FEE2E2` with semi-transparent `rgba(239, 68, 68, 0.15)` and crisp red `#EF4444`.

---

## 3. Verification & Compliance
- **Build Status:** Verified with `npm run build` — compiles 8 static and dynamic routes with zero warnings or errors.
- **Contrast Ratios:**
  - Dark mode borders (`#E4E4E7` on `#0B0B0E`): ~16.5:1 (Exceeds WCAG AAA).
  - Text on yellow badges (`#09090B` on `#FFD93D`): ~14.5:1 (Exceeds WCAG AAA).
  - Text on dark mode body (`#F4F4F5` on `#0B0B0E`): ~18.5:1 (Exceeds WCAG AAA).
