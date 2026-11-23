# MakeAPost — Dark / Light Mode, Favicon/SEO & PWA Setup

> Documentation for the production-ready theme toggle, zero-flash script, Favicon/Apple icon assets, dynamic OpenGraph/Twitter card, and Progressive Web App (PWA) configuration.

---

## 1. Zero-Flash Neobrutalist Dark / Light Mode

### Overview
MakeAPost uses a high-contrast Neobrutalist theme toggle supporting light mode (`#F8FAFC`), dark mode (`#0B0B0E`), and OS preference matching (`prefers-color-scheme`), with zero flash of unstyled content (FOUC).

### Architecture
1. **Design Tokens (`src/app/globals.css`):**
   - Light Tokens: `--bg-primary: #F8FAFC`, `--surface: #FFFFFF`, `--ink: #09090B`, `--border-color: #09090B`, `--shadow-color: #09090B`, `--dot-color: #CBD5E1`.
   - Dark Tokens (`[data-theme="dark"]`):
     - `--bg-primary: #0B0B0E`
     - `--surface: #16161C`
     - `--card-bg-subtle: #1F1F28`
     - `--ink: #F4F4F5`
     - `--muted: #A1A1AA`
     - `--border-color: #3F3F46`
     - `--shadow-color: #000000`
     - `--dot-color: #27272A`
     - `--accent-yellow: #FFD93D` (buttons & badges strictly enforce `#09090B` text for high contrast & accessibility)
     - `--accent-blue: #38BDF8` (enforces `#09090B` text for high contrast)
     - `--accent-green: #4ADE80` (enforces `#09090B` text for high contrast)
   - High-Contrast Badge & Button Rule:
     - `.badge-yellow`, `.badge-blue`, `.badge-green` always use `color: #09090B !important` to ensure text is never washed out white against high-luminance colors.
     - `.btn-primary` and `.btn-secondary` enforce `color: #09090B !important`.
     - `.navbar`, `.sidebar30`, and dropzone surfaces dynamically switch to `var(--surface)` rather than hardcoded light hex values.
2. **Blocking Script in `<head>` (`src/app/layout.js`):**
   ```js
   (function() {
     try {
       var savedTheme = localStorage.getItem('makeapost-theme');
       var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
       var theme = savedTheme || (prefersDark ? 'dark' : 'light');
       document.documentElement.setAttribute('data-theme', theme);
     } catch (e) {}
   })();
   ```
   - Paired with `suppressHydrationWarning` on `<html>` to avoid React hydration mismatch warnings.
3. **Tactile `ThemeToggle` Component (`src/components/ThemeToggle.js`):**
   - Neobrutalist tactile button (`.btn-brutal`) with Sun and Moon SVG icons.
   - Synchronizes `localStorage.getItem('makeapost-theme')` and sets `document.documentElement.setAttribute('data-theme', nextTheme)`.
   - Mounted in both the Landing Page navbar (`src/app/page.js`) and Editor header (`src/app/editor/page.js`).

---

## 2. All-Platform Favicon & Apple Touch Icons

### Asset Matrix
- `public/icon.svg`: Vector icon matching the official MakeAPost Neobrutalist logo (yellow box `#FFD93D`, black border `2.5px`, offset shadow `#09090B`, 4 viewfinder crop corners & center AI sparkle).
- `public/icons/apple-touch-icon.png`: 180x180 PNG rendered directly from the official logo vector for Safari iOS bookmarks and home screen.
- `public/icons/icon-192.png`: 192x192 PNG rendered directly from the official logo vector for Android Chrome PWA install banners.
- `public/icons/icon-512.png`: 512x512 PNG rendered directly from the official logo vector for high-density Android launcher icons and splash screens.

### Metadata Linking (`src/app/layout.js`)
Configured via Next.js metadata API:
```js
icons: {
  icon: [
    { url: '/icon.svg', type: 'image/svg+xml' },
    { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  apple: [
    { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}
```

---

## 3. Dynamic OpenGraph & Twitter/X Preview Card

### Dual-Layer OG Architecture
To guarantee 100% reliable preview cards across all social platforms (X/Twitter, LinkedIn, WhatsApp, Telegram, Discord, Slack, and opengraph.xyz/metatags.io debuggers):
1. **Dynamic `metadataBase` Resolution (`src/app/layout.js`):**
   ```js
   const getBaseUrl = () => {
     if (process.env.NEXT_PUBLIC_SITE_URL) {
       const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
       return url.startsWith('http') ? url : `https://${url}`;
     }
     if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
       return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
     }
     if (process.env.VERCEL_URL) {
       return `https://${process.env.VERCEL_URL}`;
     }
     return 'https://makeapost.app';
   };
   ```
   - Automatically adapts when deployed on Vercel preview URLs (`*.vercel.app`), avoiding hardcoded non-existent domains that cause DNS NXDOMAIN errors during social crawler scraping.
2. **Static Fallback Asset (`public/og-image.png`):**
   - High-resolution 1200x630 pre-rendered PNG served directly from `/og-image.png` with 0ms serverless cold-start latency.
3. **App Router Route Handlers (`src/app/opengraph-image.js` & `src/app/twitter-image.js`):**
   - Native App Router conventions dynamically serving generated images with `ImageResponse`.
   - Feature pills rendered with clean vector text (removing emojis to prevent missing glyphs in Satori).
   - Configured with `twitter: { card: 'summary_large_image', images: ['/og-image.png'] }`.

---

## 4. Installable Progressive Web App (PWA) Setup

### 1. Web App Manifest (`src/app/manifest.js`)
Returns JSON metadata:
- `name`: "MakeAPost — Turn Screenshots into Viral Social Posts"
- `short_name`: "MakeAPost"
- `start_url`: "/editor"
- `display`: "standalone"
- `background_color`: "#F8FAFC"
- `theme_color`: "#FFD93D"
- Full `icons` definition including 192x192, 512x512, and SVG.

### 2. Service Worker (`public/sw.js`)
- Cache-first strategy for app shell resources (`/`, `/editor`, `/icon.svg`, icons).
- Seamless background cache updates on reload.
- Non-intrusive offline fallback for core assets.

### 3. Client Registration Component (`src/components/PwaRegister.js`)
- Client-side hook registering `navigator.serviceWorker.register('/sw.js')` on production builds or supported browser environments.
- Mounted globally in `src/app/layout.js`.
