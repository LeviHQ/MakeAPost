# 06 — Zero-Cost 1-Click Native Share Intent & Clipboard System

> Architecture documentation for MakeAPost's 1-click Clipboard Image Copy + Native Web Composer Intent flow for X (Twitter), LinkedIn, and Reddit.

---

## 1. Overview & Strategy

Rather than imposing complex OAuth 2.0 app verification, fragile token storage, or third-party developer API paywalls (such as X API Enterprise or LinkedIn Partner tier requirements), MakeAPost utilizes a **Zero-Cost, Privacy-First Native Intent Architecture**:

1. **Instant 1-Click Workflow:**
   - In a single user click, the edited high-resolution canvas export is rendered to a PNG blob and written directly into the user's operating system clipboard via `navigator.clipboard.write`.
   - Simultaneously, the selected social network's official web post composer is opened in a new browser tab with the AI-crafted social copy pre-filled.
2. **Zero Storage & Zero Tokens:**
   - No social media account passwords, API tokens, or keys are ever requested or saved in any database.
   - The user remains 100% in control, previewing the post in their own authenticated social tab before pressing publish.
3. **Multi-Platform Support:**
   - **X (Twitter):** Launches the official Tweet intent dialog.
   - **LinkedIn:** Launches the official LinkedIn feed composer (`?shareActive=true`).
   - **Reddit:** Automatically parses the generated copy into a headline title (first line) and discussion body (remaining text) for Reddit's submission form.

---

## 2. Technical Implementation (`src/lib/shareIntent.js`)

### 2.1. Canvas to Clipboard (`copyCanvasToClipboard`)
```javascript
export async function copyCanvasToClipboard(canvas) {
  const blob = await canvasToBlob(canvas);

  if (navigator.clipboard && window.ClipboardItem) {
    try {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return { copied: true, blob };
    } catch (err) {
      // Automatic download fallback if browser blocks clipboard image write
      downloadPngFallback(blob);
      return { copied: false, downloaded: true, blob };
    }
  }

  downloadPngFallback(blob);
  return { copied: false, downloaded: true, blob };
}
```

### 2.2. Web Intent URL Generation (`getPlatformIntentUrl`)
- **X (Twitter):**
  `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`
- **LinkedIn:**
  `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`
- **Reddit:**
  Extracts the first line as post title (`titleLine`) and subsequent lines as markdown body (`bodyLines`):
  `https://www.reddit.com/submit?title=${encodeURIComponent(titleLine)}&text=${encodeURIComponent(bodyLines)}`

---

## 3. UI Integration (`src/components/AiStudio.js`)

Inside the AI Post Studio sidebar, each platform tab provides:
1. **Primary Neobrutalist Action CTA:**
   - `"🚀 Post on X"` (with `XIcon`)
   - `"🚀 Post on LinkedIn"` (with `LinkedInIcon`)
   - `"🚀 Post on Reddit"` (with `RedditIcon`)
2. **Secondary Copy Text Button:**
   - `"Copy Text"` / `"Copied!"` button for manual pasting if preferred.
3. **Neobrutalist Toast Feedback Banner:**
   - Displays clear instruction:
     `"✅ Image copied to clipboard! Press Ctrl+V (or Paste) inside the [Platform] composer."`
   - Includes a direct `"Download PNG"` button fallback in case the user prefers manual file upload.

---

## 4. Privacy & Cost Benefits

| Metric | Traditional OAuth 2.0 API | MakeAPost Native Intent Flow |
| :--- | :--- | :--- |
| **API Costs** | High (\$100+/mo per platform) | **\$0.00 (Zero-Cost)** |
| **Token Storage** | Requires encrypted database columns | **Zero Tokens Stored** |
| **User Setup** | Requires granting third-party app permissions | **Instant 1-Click (No Setup)** |
| **Account Ban Risk** | Third-party app flag risk | **Zero (Native Browser Session)** |
| **Platform Scope** | Limited by developer approval | **All 3 Platforms (X, LinkedIn, Reddit)** |
