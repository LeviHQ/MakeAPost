/**
 * MakeAPost — Zero-Cost 1-Click Native Composer Intent & Clipboard Utility
 * Writes edited canvas PNG directly to system clipboard and launches
 * native composer with formatted social copy pre-filled.
 */

/**
 * Triggers a download of a PNG blob or dataUrl as a fallback.
 * @param {Blob|string} imageSource
 * @param {string} filename
 */
export function downloadPngFallback(imageSource, filename = `makeapost-${Date.now()}.png`) {
  try {
    const url = typeof imageSource === 'string'
      ? imageSource
      : URL.createObjectURL(imageSource);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (typeof imageSource !== 'string') {
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    return true;
  } catch (err) {
    console.error('Download fallback error:', err);
    return false;
  }
}

/**
 * Converts an HTML5 canvas element to a PNG Blob.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error('Canvas element is missing'));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob conversion failed'));
    }, 'image/png');
  });
}

/**
 * Creates an optimized, balanced-quality PNG Blob and dataUrl suitable
 * for instant social sharing (X, LinkedIn, Reddit) and clipboard write.
 * Downsamples high-DPI retina canvases to a maximum dimension (default 1600px)
 * using bicubic smoothing, preventing multi-megabyte clipboard lag and upload limits.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} [maxDimension=1600]
 * @returns {Promise<{ blob: Blob, dataUrl: string, width: number, height: number }>}
 */
export async function createBalancedSocialBlob(canvas, maxDimension = 1600) {
  if (!canvas) {
    throw new Error('Canvas element is missing');
  }

  const width = canvas.width || 800;
  const height = canvas.height || 600;
  const maxDim = Math.max(width, height);

  // If already within balanced dimensions, export directly
  if (maxDim <= maxDimension) {
    let blob;
    try {
      blob = await canvasToBlob(canvas);
    } catch {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      blob = await res.blob();
    }
    const dataUrl = canvas.toDataURL('image/png');
    return { blob, dataUrl, width, height };
  }

  // Downscale preserving aspect ratio
  const scale = maxDimension / maxDim;
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const offscreen = document.createElement('canvas');
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const ctx = offscreen.getContext('2d');

  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
  }

  let blob;
  try {
    blob = await canvasToBlob(offscreen);
  } catch {
    const dataUrl = offscreen.toDataURL('image/png');
    const res = await fetch(dataUrl);
    blob = await res.blob();
  }
  const dataUrl = offscreen.toDataURL('image/png');

  return { blob, dataUrl, width: targetWidth, height: targetHeight };
}

/**
 * Copies canvas image directly to the user's system clipboard using
 * balanced social quality (~250-400KB) to ensure lightning-fast paste.
 * Falls back to auto-download if ClipboardItem is not supported or blocked.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<{ success: boolean, copied: boolean, downloaded: boolean, dataUrl: string, blob: Blob }>}
 */
export async function copyCanvasToClipboard(canvas) {
  if (!canvas) {
    throw new Error('Canvas element not available');
  }

  const { blob, dataUrl } = await createBalancedSocialBlob(canvas, 1600);

  // Attempt to write image directly to system clipboard
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof window !== 'undefined' &&
    window.ClipboardItem
  ) {
    try {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return {
        success: true,
        copied: true,
        downloaded: false,
        dataUrl,
        blob,
      };
    } catch (clipErr) {
      console.warn('ClipboardItem write failed, triggering PNG download fallback:', clipErr);
      downloadPngFallback(blob);
      return {
        success: true,
        copied: false,
        downloaded: true,
        dataUrl,
        blob,
      };
    }
  }

  // Browser doesn't support image clipboard API -> fallback download
  downloadPngFallback(blob);
  return {
    success: true,
    copied: false,
    downloaded: true,
    dataUrl,
    blob,
  };
}

/**
 * Generates platform-specific web intent URL with pre-filled text.
 * Uses x.com/intent/post (modern canonical X standard).
 * @param {'x'|'twitter'|'linkedin'|'reddit'} platform
 * @param {string} text
 * @returns {string}
 */
export function getPlatformIntentUrl(platform, text = '') {
  const normalized = (platform || '').toLowerCase().trim();
  const cleanText = (text || '').trim();

  if (normalized === 'x' || normalized === 'twitter') {
    // Official modern X standard endpoint that pre-fills composer text reliably
    return `https://x.com/intent/post?text=${encodeURIComponent(cleanText)}`;
  }

  if (normalized === 'linkedin') {
    return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(cleanText)}`;
  }

  if (normalized === 'reddit') {
    // Extract first line as Reddit title (up to 300 chars) and remainder as body
    const lines = cleanText.split('\n').filter((l) => l.trim().length > 0);
    const titleLine = (lines[0] || 'MakeAPost Graphic').slice(0, 300);
    const bodyLines = lines.slice(1).join('\n\n');
    return `https://www.reddit.com/submit?title=${encodeURIComponent(titleLine)}&text=${encodeURIComponent(bodyLines)}`;
  }

  return 'https://x.com';
}

/**
 * Checks if the current client is a mobile device (iOS/Android/Touch phone).
 */
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent || '') ||
    (Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 2) && /Macintosh/i.test(navigator.userAgent || ''));
}

/**
 * Handles Option A Social Sharing:
 * - On Mobile: Uses native Web Share Level 2 (navigator.share) so text + image go directly to native app.
 * - On Desktop for X & Reddit: Pre-fills text via URL intent and copies balanced image to clipboard (Ctrl+V attaches it).
 * - On Desktop for LinkedIn: Opens LinkedIn with pre-filled text and auto-downloads the balanced screenshot (since LinkedIn doesn't support Ctrl+V image paste).
 *
 * @param {HTMLCanvasElement} canvas
 * @param {'x'|'linkedin'|'reddit'} platform
 * @param {string} text
 * @returns {Promise<{ directShare: boolean, copied: boolean, downloaded: boolean, cancelled: boolean, intentUrl: string|null, dataUrl: string }>}
 */
export async function copyImageAndOpenComposer(canvas, platform, text) {
  if (!canvas) {
    throw new Error('Canvas element not available');
  }

  const cleanText = (text || '').trim();
  const intentUrl = getPlatformIntentUrl(platform, cleanText);
  const filename = `makeapost-${platform}-${Date.now()}.png`;

  // 1. Prepare balanced social image (max 1600px, crisp, lightweight ~300KB)
  const balanced = await createBalancedSocialBlob(canvas, 1600);
  const dataUrl = balanced.dataUrl;

  // 2. MOBILE FLOW: Native Web Share Sheet (Passes both text and image file directly)
  if (isMobileDevice() && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      let file;
      try {
        file = new File([balanced.blob], filename, { type: 'image/png' });
      } catch {
        file = balanced.blob;
        file.name = filename;
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Copy post text to mobile clipboard before launching OS Share Sheet so apps
        // like LinkedIn (which drop shared text when receiving an image) can simply Paste it.
        if (cleanText && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          try {
            await navigator.clipboard.writeText(cleanText);
          } catch {}
        }
        await navigator.share({
          title: 'MakeAPost',
          text: cleanText,
          files: [file],
        });
        return {
          directShare: true,
          copied: true,
          downloaded: false,
          cancelled: false,
          intentUrl: null,
          dataUrl,
        };
      }
    } catch (shareErr) {
      if (shareErr.name === 'AbortError') {
        return {
          directShare: false,
          copied: false,
          downloaded: false,
          cancelled: true,
          intentUrl: null,
          dataUrl,
        };
      }
      console.warn('Mobile Web Share dismissed or failed, falling back to desktop flow:', shareErr);
    }
  }

  // 3. DESKTOP FLOW:
  // Step 3a: Copy balanced image to clipboard FIRST while MakeAPost tab has active focus!
  let copied = false;
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof window !== 'undefined' &&
    window.ClipboardItem
  ) {
    try {
      const item = new ClipboardItem({ 'image/png': balanced.blob });
      await navigator.clipboard.write([item]);
      copied = true;
    } catch (clipErr) {
      console.warn('Clipboard write failed while focused:', clipErr);
    }
  }

  // Step 3b: Open target platform composer in new tab
  if (typeof window !== 'undefined') {
    const win = window.open(intentUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = intentUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  // Step 3c: For LinkedIn on Desktop, auto-download the screenshot because LinkedIn's
  // web composer does NOT support pasting images via Ctrl+V into the post body.
  let downloaded = false;
  if (platform === 'linkedin') {
    downloadPngFallback(balanced.blob, filename);
    downloaded = true;
  } else if (!copied) {
    // For X & Reddit, only download if clipboard write truly failed
    downloadPngFallback(balanced.blob, filename);
    downloaded = true;
  }

  return {
    directShare: false,
    copied,
    downloaded,
    cancelled: false,
    intentUrl,
    dataUrl,
  };
}
