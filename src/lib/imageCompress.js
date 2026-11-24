/**
 * MakeAPost Client-Side Image Compression Utility
 * 
 * Compresses an HTMLCanvasElement or base64 DataURL proportionally
 * to a maximum width of 768px (never upscaling smaller images)
 * at 0.65 JPEG quality before transmitting to /api/generate.
 * 
 * Fits Gemini Vision processing within a single token tile.
 */

export async function compressImageForAI(canvasOrDataUrl) {
  if (!canvasOrDataUrl) {
    throw new Error('No canvas or image data provided for compression.');
  }

  // Helper to process an Image element onto an offscreen canvas
  const processImageElement = (img) => {
    const origW = img.width || img.naturalWidth || 800;
    const origH = img.height || img.naturalHeight || 600;

    // Never upscale smaller images; cap max width at 640px
    const maxWidth = 640;
    let targetW = origW;
    let targetH = origH;

    if (origW > maxWidth) {
      const scale = maxWidth / origW;
      targetW = maxWidth;
      targetH = Math.round(origH * scale);
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = targetW;
    offscreenCanvas.height = targetH;

    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context on offscreen canvas.');
    }

    // High-quality downsampling smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill white background in case source has transparency
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);

    // Draw downscaled image
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Export as JPEG at 0.60 quality
    const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.60);
    const base64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');

    return {
      base64,
      mimeType: 'image/jpeg',
      dataUrl,
      width: targetW,
      height: targetH,
    };
  };

  // 1. If passed an HTMLCanvasElement directly
  if (typeof HTMLCanvasElement !== 'undefined' && canvasOrDataUrl instanceof HTMLCanvasElement) {
    const origW = canvasOrDataUrl.width;
    const origH = canvasOrDataUrl.height;
    const maxWidth = 640;

    let targetW = origW;
    let targetH = origH;

    if (origW > maxWidth) {
      const scale = maxWidth / origW;
      targetW = maxWidth;
      targetH = Math.round(origH * scale);
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = targetW;
    offscreenCanvas.height = targetH;

    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create offscreen canvas context.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Solid white base
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);

    ctx.drawImage(canvasOrDataUrl, 0, 0, targetW, targetH);

    const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.60);
    const base64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');

    return {
      base64,
      mimeType: 'image/jpeg',
      dataUrl,
      width: targetW,
      height: targetH,
    };
  }

  // 2. If passed a DataURL string
  if (typeof canvasOrDataUrl === 'string') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          resolve(processImageElement(img));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image data URL into Image element.'));
      };
      img.src = canvasOrDataUrl;
    });
  }

  throw new Error('Invalid input: expected HTMLCanvasElement or base64 DataURL.');
}
