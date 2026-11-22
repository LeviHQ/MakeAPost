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
2. **Apply User Tone:**
   - `🛠️ Build in Public`: Transparent numbers, learnings, milestones, and challenges.
   - `⚡ Viral Hook`: Curiosity gaps, counter-intuitive statements, short punchy lines.
   - `📖 Storytelling`: Problem -> revelation -> outcome narrative structure.
   - `💻 Tech Breakdown`: Engineering choices, architecture trade-offs, and technical rationale.
3. **Respect Strict Platform Lengths:**
   - `x_post`: Strictly under 280 chars, direct builder tone, no hashtag spam.
   - `linkedin_post`: Double-spaced lines for mobile readability, lesson/takeaway, closing discussion prompt.
   - `reddit_post`: Self-post markdown format, humble builder tone, conversational for developer communities.

---

## 3. Dynamic 30% AI Studio UI (`src/components/AiStudio.js`)

Mounted within the 30% Left Sidebar of `/editor` when **"✨ AI Mode"** is active:

1. **State & Tone Selection:**
   - 4 Neobrutalist tone selector chips (`Build in Public`, `Viral Hook`, `Storytelling`, `Tech Breakdown`).
   - Optional extra context textarea to guide specific topics or campaigns.
2. **Empty Canvas Guard:**
   - If no image is currently on the 70% canvas, displays a Neobrutalist banner guiding the user to paste (`Ctrl+V`) or load an image first.
3. **Tactile Generation Button:**
   - `#FFD93D` Neobrutalist button with an active spinning loading indicator and disabled state while running.
4. **Segmented Platform Tabs:**
   - Interactive pill switcher `[ 𝕏 X | 💼 LinkedIn | 👾 Reddit ]` with live character counter badge for X.
5. **Realistic Social Feed Card:**
   - Platform-styled author header (handle, avatar badge, timestamp).
   - Editable textarea allowing real-time edits to the generated copy with live character tracking.
   - Mini thumbnail preview of the user's beautified canvas screenshot attached directly to the post preview.
   - Action bar: One-click "Copy Post 📋" button with instant tactile feedback.
   - For X: "Post on 𝕏 ↗" button directly opening `https://twitter.com/intent/tweet?text=...`.

---

## 4. Privacy & Stateless Architecture Guarantee
- **Zero Database Persistence:** No prompt, generated post, or screenshot is written to any database.
- **In-Memory Lifespan:** Posts live exclusively in React client memory during the active browser session.
