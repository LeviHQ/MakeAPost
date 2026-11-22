# Documentation: Phase 2 — Complete Standalone Image Editor (Reordered & Pro Configurations Update)

## 1. Overview
The MakeAPost Studio Editor (`/editor`) provides a 100% client-side, browser-based screenshot beautifier and annotation suite running on HTML5 `<canvas>`. This update reorders sidebar sections, expands background choices, integrates an automatic default branding watermark, resolves selection persistence bugs, and introduces **Core & Pro Settings** (3D Tilt, macOS custom window title, ambient backlight glow, canvas outer borders, and vertical alignment).

---

## 2. Updated Sidebar Control Sections Order (`src/components/ModeSidebar.js`)
1. **1. Aspect Ratio:** Pills for `Auto`, `16:9`, `1:1`, `4:5`, and `9:16`.
2. **2. Frame & Styling:** Frame style pills (`None`, `macOS`, `Neobrutal`) and sliders for `Canvas Padding` (0–120px), `Corner Radius` (0–32px), and `Drop Shadow` (0–60px).
3. **3. Annotations & Highlights:** Tools (`Pointer`, `Box`, `Arrow`, `Blur`, `Text`), color picker palette (`#EF4444`, `#FFD93D`, `#38BDF8`, `#09090B`), and delete/clear buttons.
4. **4. Backgrounds:**
   - **16 Curated Gradients:** Sunset, Cyber, Aurora, Candy, Midnight, Lavender, Ocean, Sunbeam, Neon Lime, Rose Gold, Electric Violet, Mint Fresh, Cosmic Dark, Retro Sunset, Deep Marine, Hyper Pop.
   - **8 Solids & Transparent:** Obsidian `#09090B`, Pure White `#FFFFFF`, Off-White `#F8FAFC`, Yellow `#FFD93D`, Sky Blue `#38BDF8`, Emerald `#10B981`, Rose `#F43F5E`, Purple `#8B5CF6`, and Transparent checkerboard.
5. **5. Core & Pro Configurations (Underrated Studio Settings):**
   - **3D Perspective Tilt:** Slider (-8° to +8°) and quick preset buttons (`-4°`, `0°`, `+4°`) that mathematically rotate canvas elements around their center with inverse mouse transformation support.
   - **macOS Window Title:** Custom title text centered in the macOS window chrome (e.g. `terminal`, `app.tsx`, `growth.dashboard`).
   - **Ambient Aura Glow:** Soft radial color lighting diffused behind the framed screenshot.
   - **Canvas Outer Border:** Neobrutalist poster-like outer border options (`None`, `Thin 2px`, `Bold 4px`).
   - **Vertical Positioning:** Alignment pills (`Center`, `Top-Heavy`, `Bottom-Heavy`).

---

## 3. Automatic Branding Watermark (`made with makeapost.app`)
- The manual watermark input was removed from sidebar controls.
- By default, the canvas automatically renders an authentic, high-contrast Neobrutalist badge in the bottom-right corner:
  `⚡ made with makeapost.app`
  - Rendered with an obsidian `#09090B` pill, `#FFD93D` border, hard shadow, and crisp white monospace typography.
  - Positioned so it exports cleanly at 2x resolution and can be tied into future Pro/premium tiers for removal.

---

## 4. Annotation Selection Bug Fix
- **Root Cause:** When drawing completed (`handleMouseUp`), the newly drawn shape was automatically given `selectedAnnotationId`, leaving an unwanted dashed selection ring permanently visible on the canvas.
- **Resolution:**
  1. Drawing completion no longer sets `selectedAnnotationId`.
  2. The dashed selection ring is strictly restricted to `activeTool === 'select'`.
  3. Clicking on any blank area of the canvas or on the workspace background immediately clears selection (`onSelectAnnotation(null)`).
  4. Pre-export deselects any active annotation before `canvas.toBlob` and `canvas.toDataURL` execute, guaranteeing zero selection artifacts in exported PNGs.

---

## 5. 3D Tilt Mathematics & Inverse Mouse Coordinates
When tilt angle $\theta$ is applied:
1. **Rendering:**
   $$\text{Translate}\left(X_c + \frac{W_c}{2}, Y_c + \frac{H_c}{2}\right) \to \text{Rotate}(\theta) \to \text{Translate}\left(-\left(X_c + \frac{W_c}{2}\right), -\left(Y_c + \frac{H_c}{2}\right)\right)$$
2. **Interactive Coordinate Inversion:**
   To allow accurate click-and-draw annotations even when the canvas is tilted, screen coordinates are translated through an inverse rotation matrix $(-\theta)$ centered on the canvas midpoint:
   $$X' = X_0 + ((X - X_0)\cos(-\theta) - (Y - Y_0)\sin(-\theta))$$
   $$Y' = Y_0 + ((X - X_0)\sin(-\theta) + (Y - Y_0)\cos(-\theta))$$
