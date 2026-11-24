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
    document.body.removeChild(a);
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
 * Copies canvas image directly to the user's system clipboard.
 * Falls back to auto-download if ClipboardItem is not supported or blocked.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<{ success: boolean, copied: boolean, downloaded: boolean, dataUrl: string, blob: Blob }>}
 */
export async function copyCanvasToClipboard(canvas) {
  if (!canvas) {
    throw new Error('Canvas element not available');
  }

  const dataUrl = canvas.toDataURL('image/png');
  let blob = null;

  try {
    blob = await canvasToBlob(canvas);
  } catch {
    // Fallback: convert dataURL to blob
    const res = await fetch(dataUrl);
    blob = await res.blob();
  }

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
 * @param {'x'|'twitter'|'linkedin'|'reddit'} platform
 * @param {string} text
 * @returns {string}
 */
export function getPlatformIntentUrl(platform, text = '') {
  const normalized = (platform || '').toLowerCase().trim();
  const cleanText = (text || '').trim();

  if (normalized === 'x' || normalized === 'twitter') {
    return `https://x.com/intent/tweet?text=${encodeURIComponent(cleanText)}`;
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
 * Copies the canvas PNG image to system clipboard and opens the platform's
 * native web composer in a new tab.
 * @param {HTMLCanvasElement} canvas
 * @param {'x'|'linkedin'|'reddit'} platform
 * @param {string} text
 * @returns {Promise<{ copied: boolean, downloaded: boolean, intentUrl: string, dataUrl: string }>}
 */
export async function copyImageAndOpenComposer(canvas, platform, text) {
  const clipResult = await copyCanvasToClipboard(canvas);
  const intentUrl = getPlatformIntentUrl(platform, text);

  // Open the native composer tab
  if (typeof window !== 'undefined') {
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  }

  return {
    copied: clipResult.copied,
    downloaded: clipResult.downloaded,
    intentUrl,
    dataUrl: clipResult.dataUrl,
  };
}
