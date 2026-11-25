# MakeAPost — Token-Optimized AI Post Studio & Multimodal Pipeline

> Comprehensive documentation for the dual-compression image pipeline, Google Gemini Vision API integration, single-shot JSON schema, and the 30% dynamic AI Studio UI.

---

## 1. Dual-Stage Image Compression Architecture

To maximize performance, minimize latency, and ensure that every screenshot sent to Google Gemini fits within a single minimal vision token tile without unnecessary cost, MakeAPost employs a **two-tier compression gate**:

```
[HTML5 Canvas / Screenshot]
         │
         ▼
[Stage 1: Client-Side Compression (`src/lib/imageCompress.js`)]
  • Downsamples proportionally to max 768px width (never upscales smaller assets)
  • Smooths image and fills transparent backing with solid base
  • Encodes to JPEG at 0.65 quality (~40-80 KB)
         │
         ▼  (HTTP POST /api/generate)
[Stage 2: Backend Compression Gate (`src/app/api/generate/route.js`)]
  • Sharp buffer processing: `.resize({ width: 640, withoutEnlargement: true })`
  • Compresses to JPEG at 60% quality (~25-45 KB)
         │
         ▼
[Google Gemini Multimodal Vision API]
  • 1 Single Vision Token Tile consumed
```

### Stage 1: `compressImageForAI(canvasOrDataUrl)` (`src/lib/imageCompress.js`)
- **Inputs:** `HTMLCanvasElement` or base64 DataURL string.
- **Constraints:** Max width `768px`, aspect ratio preserved, no upscaling if smaller.
- **Output:** `{ base64, mimeType: 'image/jpeg', dataUrl, width, height }`.

### Stage 2: Sharp Server-Side Gate (`src/app/api/generate/route.js`)
- Receives base64 string, converts to Buffer, resizes via `sharp` to a maximum width of `640px` at 60% JPEG quality.
- Guarantees payload payload predictability even if a client bypasses Stage 1.

---

## 2. Backend Route & Gemini Single-Shot JSON Output

### Route Specification
- **Endpoint:** `POST /api/generate`
- **Runtime:** Node.js (`export const runtime = 'nodejs'`)
- **Authentication:** Validates server-side `process.env.GEMINI_API_KEY`. Returns structured 401 error if missing.

### Gemini API Configuration
- **Model Cascade:** `gemini-3.5-flash` with graceful automatic fallback to `gemini-3.5-flash-lite` and `gemini-3.8-flash` (or configurable via `process.env.GEMINI_MODEL`).
- **Response Format:** `application/json` with enforced `responseSchema`.

### Single-Shot Response Schema
```json
{
  "type": "object",
  "properties": {
    "x_post": {
      "type": "string",
      "description": "Punchy X/Twitter post strictly under 280 characters without cringe hashtags."
    },
    "linkedin_post": {
      "type": "string",
      "description": "Line-spaced, engaging LinkedIn post with a strong hook and clear takeaway."
    },
    "reddit_post": {
      "type": "string",
      "description": "Authentic community-friendly Reddit post in markdown format."
    }
  },
  "required": ["x_post", "linkedin_post", "reddit_post"]
}
```

### Vision Prompt Strategy
Gemini is instructed through system directives to:
1. **Transcribe & Understand Visual Details:** Read visible code syntax, framework imports, console/terminal logs, revenue/MRR figures, charts, and highlighted regions (user-drawn red/yellow boxes or arrows).
2. **Apply User Tone (6 Core Developer & Tech Archetypes):**
   - `🔨 Build in Public`: Transparent numbers, MRR milestones, user growth, and builder lessons.
   - `🚀 Ship & Launch`: High-energy feature drops, v1.0 releases, repos & project launches.
   - `💻 Tech Breakdown`: Engineering choices, system architecture trade-offs, and code review.
   - `⚡ Viral Hook`: Curiosity gaps, counter-intuitive statements, and punchy scroll-stopping hooks.
   - `📖 Founder Story`: Problem -> debugging war story -> breakthrough outcome narrative journey.
   - `💡 How It Works (ELI5)`: Dead-simple, plain-English breakdown of complex technical concepts.
3. **Respect Strict Platform Lengths:**
   - `x_post`: Strictly under 280 chars, direct builder tone, no hashtag spam.
   - `linkedin_post`: Double-spaced lines for mobile readability, lesson/takeaway, closing discussion prompt.
   - `reddit_post`: Self-post markdown format, humble builder tone, conversational for developer communities.

---

## 3. Dynamic 30% AI Studio UI (`src/components/AiStudio.js`)

Mounted within the 30% Left Sidebar of `/editor` when **"✨ AI Mode"** is active:

1. **1. Select Tone & 2. Target Platforms:**
   - **1. Select Tone:** 6 Neobrutalist tone selector chips in a balanced 2-column grid (`Build in Public`, `Ship & Launch`, `Tech Breakdown`, `Viral Hook`, `Founder Story`, `How It Works`) with real-time dynamic micro-descriptions.
   - **2. Target Platforms:** 3 multi-select platform toggle buttons with official brand icons (`X`, `LinkedIn`, `Reddit`). Defaults to `['x']` every time for maximum speed and zero wasted tokens; `/api/generate` dynamically scopes its prompt and `responseSchema` strictly to the requested platform(s).
   - **3. Extra Context (Optional):** Optional textarea to guide specific topics or campaigns.
2. **Empty Canvas Guard:**
   - If no image is currently on the 70% canvas, displays a Neobrutalist banner guiding the user to paste (`Ctrl+V`) or load an image first.
3. **Tactile Generation Button:**
   - `#FFD93D` Neobrutalist button dynamically reflecting the selected platform(s) (e.g., `Generate X Post`) with an active spinning loading indicator while running.
4. **Segmented Platform Tabs & On-Demand Generation:**
   - Interactive pill switcher `[ X | LinkedIn | Reddit ]` with green ready-dot indicators for platforms that have generated content, plus live character counter badge for X.
   - Switching to an ungenerated platform tab renders an inline **"Generate [Platform] Post"** on-demand card instead of a blank box, allowing users to generate that single platform later without regenerating or overwriting existing posts.
5. **Realistic Social Feed Card:**
   - Platform-styled author header (handle, avatar badge, timestamp).
   - Editable textarea allowing real-time edits to the generated copy with live character tracking.
   - Mini thumbnail preview of the user's beautified canvas screenshot attached directly to the post preview.
   - Action bar: One-click "Copy Text" button and full-width platform trigger buttons ("Post on X", "Post on LinkedIn", "Post on Reddit").
   - **Knowledge Guide Modal (`src/components/AiStudio.js` & `src/lib/shareIntent.js`):**
     - Clicking any platform post button triggers a responsive, Neobrutalist step-by-step Knowledge Guide popup.
     - Automatically adapts instructions based on platform and device (Mobile 1-tap Native Share vs. Desktop 2-step clipboard paste).
     - Provides tactile close via backdrop click, Escape key, or top-right cross button.
     - Modal action button initiates the direct export: pre-fills text, copies balanced image to clipboard (or auto-downloads for LinkedIn), and opens composer.

---

## 4. Privacy & Stateless Architecture Guarantee
- **Zero Database Persistence:** No prompt, generated post, or screenshot is written to any database.
- **In-Memory Lifespan:** Posts live exclusively in React client memory during the active studio session.
- **Cross-Mode State Preservation:** `<AiStudio />` is kept continuously mounted in `ModeSidebar.js` using CSS display toggling, ensuring generated posts and custom edits persist seamlessly when switching between '1. Editor' and '2. AI Mode'. The state is only cleared when the user clicks 'New Image (Reset)' or navigates away from `/editor`.
