'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, FolderOpen, Code2, BarChart3 } from 'lucide-react';

// Sample 1: Code Editor Snippet (Self-contained SVG data URL)
const SAMPLE_CODE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="460" viewBox="0 0 800 460">
  <rect width="800" height="460" rx="10" fill="%230B0F19"/>
  <rect x="0" y="0" width="800" height="42" rx="10" fill="%23131B2E"/>
  <circle cx="24" cy="21" r="6" fill="%23EF4444"/>
  <circle cx="44" cy="21" r="6" fill="%23F59E0B"/>
  <circle cx="64" cy="21" r="6" fill="%2310B981"/>
  <text x="92" y="26" fill="%2394A3B8" font-family="monospace" font-size="13">make-a-post-engine.js</text>
  <text x="36" y="80" fill="%2364748B" font-family="monospace" font-size="15">// 100% Client-Side Canvas Engine</text>
  <text x="36" y="115" fill="%2338BDF8" font-family="monospace" font-size="15" font-weight="bold">import</text>
  <text x="96" y="115" fill="%23F8FAFC" font-family="monospace" font-size="15">{ renderScreenshot } </text>
  <text x="280" y="115" fill="%2338BDF8" font-family="monospace" font-size="15" font-weight="bold">from</text>
  <text x="330" y="115" fill="%234ADE80" font-family="monospace" font-size="15">&apos;@makeapost/engine&apos;</text>
  <text x="36" y="165" fill="%23FFD93D" font-family="monospace" font-size="15" font-weight="bold">export async function</text>
  <text x="250" y="165" fill="%23F8FAFC" font-family="monospace" font-size="15"> generateViralPost(canvas) {</text>
  <text x="56" y="200" fill="%23F8FAFC" font-family="monospace" font-size="15">  const result = await ai.singleShot({</text>
  <text x="76" y="235" fill="%2364748B" font-family="monospace" font-size="15">    scale: 2.0, // High-DPI Output</text>
  <text x="76" y="270" fill="%23F8FAFC" font-family="monospace" font-size="15">    secretApiKey: &apos;sk_live_994821034secret&apos;,</text>
  <text x="76" y="305" fill="%23F8FAFC" font-family="monospace" font-size="15">    platforms: [&apos;x&apos;, &apos;linkedin&apos;, &apos;reddit&apos;]</text>
  <text x="56" y="340" fill="%23F8FAFC" font-family="monospace" font-size="15">  });</text>
  <text x="56" y="380" fill="%2338BDF8" font-family="monospace" font-size="15">  return</text>
  <text x="120" y="380" fill="%23F8FAFC" font-family="monospace" font-size="15"> result;</text>
  <text x="36" y="420" fill="%23F8FAFC" font-family="monospace" font-size="15">}</text>
</svg>`;

// Sample 2: SaaS Metrics Dashboard (Self-contained SVG data URL)
const SAMPLE_ANALYTICS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="460" viewBox="0 0 800 460">
  <rect width="800" height="460" rx="10" fill="%23FFFFFF"/>
  <rect x="0" y="0" width="800" height="50" rx="10" fill="%23F8FAFC" stroke="%23E2E8F0"/>
  <circle cx="28" cy="25" r="7" fill="%23FFD93D" stroke="%2309090B" stroke-width="1.5"/>
  <text x="48" y="30" fill="%2309090B" font-family="sans-serif" font-size="15" font-weight="bold">MakeAPost Growth Dashboard</text>
  <rect x="30" y="75" width="225" height="110" rx="8" fill="%23F8FAFC" stroke="%2309090B" stroke-width="2"/>
  <text x="46" y="105" fill="%23475569" font-family="sans-serif" font-size="12" font-weight="bold">MONTHLY RECURRING (MRR)</text>
  <text x="46" y="145" fill="%2309090B" font-family="sans-serif" font-size="28" font-weight="800">$18,420</text>
  <text x="180" y="145" fill="%2316A34A" font-family="sans-serif" font-size="13" font-weight="bold">+48%</text>
  <rect x="285" y="75" width="225" height="110" rx="8" fill="%23F8FAFC" stroke="%2309090B" stroke-width="2"/>
  <text x="301" y="105" fill="%23475569" font-family="sans-serif" font-size="12" font-weight="bold">VIRAL POST IMPRESSIONS</text>
  <text x="301" y="145" fill="%2309090B" font-family="sans-serif" font-size="28" font-weight="800">482,900</text>
  <text x="435" y="145" fill="%232563EB" font-family="sans-serif" font-size="13" font-weight="bold">+112%</text>
  <rect x="540" y="75" width="230" height="110" rx="8" fill="%23F8FAFC" stroke="%2309090B" stroke-width="2"/>
  <text x="556" y="105" fill="%23475569" font-family="sans-serif" font-size="12" font-weight="bold">CLICK-THROUGH RATE</text>
  <text x="556" y="145" fill="%2309090B" font-family="sans-serif" font-size="28" font-weight="800">24.8%</text>
  <text x="668" y="145" fill="%2316A34A" font-family="sans-serif" font-size="13" font-weight="bold">Top 3%</text>
  <path d="M 45 400 C 160 360, 270 330, 380 280 C 490 230, 600 210, 755 180" fill="none" stroke="%23FFD93D" stroke-width="6" stroke-linecap="round"/>
  <path d="M 45 400 C 160 360, 270 330, 380 280 C 490 230, 600 210, 755 180 L 755 420 L 45 420 Z" fill="rgba(255, 217, 61, 0.15)"/>
  <circle cx="755" cy="180" r="7" fill="%2309090B"/>
</svg>`;

// Expanded 16 Curated Modern Gradients
export const GRADIENT_PRESETS = {
  sunset: { name: 'Sunset', colors: ['#FF512F', '#DD2476'] },
  cyber: { name: 'Cyber', colors: ['#4F46E5', '#7C3AED', '#DB2777'] },
  aurora: { name: 'Aurora', colors: ['#10B981', '#06B6D4', '#3B82F6'] },
  candy: { name: 'Candy', colors: ['#F43F5E', '#FB7185', '#FBBF24'] },
  midnight: { name: 'Midnight', colors: ['#0F172A', '#1E293B', '#334155'] },
  lavender: { name: 'Lavender', colors: ['#8B5CF6', '#EC4899'] },
  ocean: { name: 'Ocean', colors: ['#0284C7', '#0EA5E9', '#38BDF8'] },
  sunbeam: { name: 'Sunbeam', colors: ['#F59E0B', '#FBBF24', '#F43F5E'] },
  neonLime: { name: 'Neon Lime', colors: ['#84CC16', '#10B981', '#06B6D4'] },
  roseGold: { name: 'Rose Gold', colors: ['#F43F5E', '#FB7185', '#FDA4AF'] },
  electric: { name: 'Electric', colors: ['#6366F1', '#A855F7', '#EC4899'] },
  mint: { name: 'Mint Fresh', colors: ['#34D399', '#059669', '#047857'] },
  cosmic: { name: 'Cosmic Dark', colors: ['#18181B', '#27272A', '#3F3F46'] },
  retroWarm: { name: 'Retro Sunset', colors: ['#EA580C', '#D97706', '#CA8A04'] },
  deepBlue: { name: 'Deep Marine', colors: ['#1E3A8A', '#1D4ED8', '#3B82F6'] },
  hyperPop: { name: 'Hyper Pop', colors: ['#EC4899', '#8B5CF6', '#3B82F6'] },
};

// 8 Solid Color Presets
export const SOLID_PRESETS = [
  { name: 'Obsidian', hex: '#09090B' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Off-White', hex: '#F8FAFC' },
  { name: 'Yellow', hex: '#FFD93D' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Purple', hex: '#8B5CF6' },
];

export default function CanvasEditor({
  image,
  onImageLoaded,
  aspectRatio = 'auto',
  background = 'cyber',
  padding = 48,
  borderRadius = 16,
  shadow = 24,
  frameStyle = 'macos',
  windowTitle = 'preview.png',
  tilt = 0,
  ambientGlow = false,
  canvasBorder = 'none',
  verticalAlign = 'center',
  activeTool = 'select',
  annotationColor = '#EF4444',
  annotations = [],
  onAnnotationsChange,
  selectedAnnotationId,
  onSelectAnnotation,
  canvasRef,
}) {
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [textPromptOpen, setTextPromptOpen] = useState(false);
  const [pendingTextPos, setPendingTextPos] = useState(null);
  const [textInputVal, setTextInputVal] = useState('');

  // 1. Image Ingestion Helper
  const loadFromDataUrl = useCallback(
    (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        onImageLoaded({
          src: dataUrl,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 500,
          element: img,
        });
        if (onSelectAnnotation) onSelectAnnotation(null);
      };
      img.src = dataUrl;
    },
    [onImageLoaded, onSelectAnnotation]
  );

  // Global Ctrl+V Paste Listener
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                loadFromDataUrl(event.target.result);
              }
            };
            reader.readAsDataURL(file);
            e.preventDefault();
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [loadFromDataUrl]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer?.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadFromDataUrl(event.target.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadFromDataUrl(event.target.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // 2. High-DPI HTML5 Canvas Rendering Pipeline
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !image?.element) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Base dimensions calculation
    const imgNaturalW = image.width || 800;
    const imgNaturalH = image.height || 500;

    // Cap display size for crisp compositing
    const maxDimension = 1100;
    let targetImgW = imgNaturalW;
    let targetImgH = imgNaturalH;
    if (targetImgW > maxDimension) {
      targetImgH = Math.round(targetImgH * (maxDimension / targetImgW));
      targetImgW = maxDimension;
    }

    const titlebarHeight = frameStyle === 'macos' ? 38 : 0;
    const contentW = targetImgW;
    const contentH = targetImgH + titlebarHeight;

    // Aspect ratio calculation
    let canvasW = contentW + padding * 2;
    let canvasH = contentH + padding * 2;

    if (aspectRatio === '16:9') {
      const targetRatio = 16 / 9;
      if (canvasW / canvasH > targetRatio) {
        canvasH = Math.round(canvasW / targetRatio);
      } else {
        canvasW = Math.round(canvasH * targetRatio);
      }
    } else if (aspectRatio === '1:1') {
      const maxSide = Math.max(canvasW, canvasH);
      canvasW = maxSide;
      canvasH = maxSide;
    } else if (aspectRatio === '4:5') {
      const targetRatio = 4 / 5;
      if (canvasW / canvasH > targetRatio) {
        canvasH = Math.round(canvasW / targetRatio);
      } else {
        canvasW = Math.round(canvasH * targetRatio);
      }
    } else if (aspectRatio === '9:16') {
      const targetRatio = 9 / 16;
      if (canvasW / canvasH > targetRatio) {
        canvasH = Math.round(canvasW / targetRatio);
      } else {
        canvasW = Math.round(canvasH * targetRatio);
      }
    }

    // High-DPI scaling: 2x retina pixel buffer
    const scale = 2;
    canvas.width = canvasW * scale;
    canvas.height = canvasH * scale;
    canvas.style.width = `${canvasW}px`;
    canvas.style.height = `${canvasH}px`;

    ctx.save();
    ctx.scale(scale, scale);

    // Step A: Background Render
    if (background === 'transparent') {
      ctx.clearRect(0, 0, canvasW, canvasH);
    } else if (background.startsWith('#')) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      const preset = GRADIENT_PRESETS[background] || GRADIENT_PRESETS.cyber;
      const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      const step = 1 / (preset.colors.length - 1);
      preset.colors.forEach((col, idx) => {
        grad.addColorStop(idx * step, col);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // Canvas Outer Frame (Optional Neobrutalist border)
    if (canvasBorder === 'thin') {
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, canvasW - 3, canvasH - 3);
    } else if (canvasBorder === 'bold') {
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, canvasW - 6, canvasH - 6);
    }

    // Content Coordinates with Vertical Alignment
    const contentX = Math.round((canvasW - contentW) / 2);
    let contentY = Math.round((canvasH - contentH) / 2);
    if (verticalAlign === 'top') {
      contentY = Math.max(padding, Math.round(padding * 0.8));
    } else if (verticalAlign === 'bottom') {
      contentY = Math.max(padding, canvasH - contentH - padding);
    }

    // Step B: Ambient Backlight Glow (Underrated Setting)
    if (ambientGlow) {
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        contentX + contentW / 2,
        contentY + contentH / 2,
        Math.min(contentW, contentH) * 0.2,
        contentX + contentW / 2,
        contentY + contentH / 2,
        Math.max(contentW, contentH) * 0.75
      );
      glowGrad.addColorStop(0, 'rgba(255, 217, 61, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.restore();
    }

    // Save context before 3D Tilt transformation
    ctx.save();

    // Step C: Apply 3D Tilt / Rotation
    if (tilt !== 0) {
      const centerX = contentX + contentW / 2;
      const centerY = contentY + contentH / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((tilt * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // Step D: Drop Shadow Render
    if (shadow > 0) {
      ctx.save();
      if (frameStyle === 'brutal') {
        // Hard Neobrutalist Shadow
        ctx.fillStyle = '#09090B';
        const brutalOffset = Math.max(4, Math.round(shadow / 3.5));
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(contentX + brutalOffset, contentY + brutalOffset, contentW, contentH, borderRadius);
        } else {
          ctx.rect(contentX + brutalOffset, contentY + brutalOffset, contentW, contentH);
        }
        ctx.fill();
      } else {
        // Soft Realistic Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = shadow;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.round(shadow * 0.45);
        ctx.fillStyle = '#09090B';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(contentX, contentY, contentW, contentH, borderRadius);
        } else {
          ctx.rect(contentX, contentY, contentW, contentH);
        }
        ctx.fill();
      }
      ctx.restore();
    }

    // Step E: Content Frame Clip & Background
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(contentX, contentY, contentW, contentH, borderRadius);
    } else {
      ctx.rect(contentX, contentY, contentW, contentH);
    }
    ctx.clip();

    // macOS Titlebar
    if (frameStyle === 'macos') {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(contentX, contentY, contentW, titlebarHeight);

      // Titlebar Window Dots
      const dotY = contentY + 19;
      const dotRadius = 5.5;

      // Close (Red)
      ctx.beginPath();
      ctx.arc(contentX + 18, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FF5F56';
      ctx.fill();
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Minimize (Yellow)
      ctx.beginPath();
      ctx.arc(contentX + 36, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFBD2E';
      ctx.fill();
      ctx.strokeStyle = '#09090B';
      ctx.stroke();

      // Maximize (Green)
      ctx.beginPath();
      ctx.arc(contentX + 54, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#27C93F';
      ctx.fill();
      ctx.strokeStyle = '#09090B';
      ctx.stroke();

      // Window Title Centered
      if (windowTitle && windowTitle.trim().length > 0) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(windowTitle.trim(), contentX + contentW / 2, dotY);
        ctx.textAlign = 'left';
      }

      // Titlebar Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(contentX, contentY + titlebarHeight);
      ctx.lineTo(contentX + contentW, contentY + titlebarHeight);
      ctx.stroke();
    }

    // Step F: User Image Render
    const imgX = contentX;
    const imgY = contentY + titlebarHeight;
    ctx.drawImage(image.element, imgX, imgY, targetImgW, targetImgH);

    ctx.restore(); // Restore clip

    // Step G: Neobrutal Frame Outline
    if (frameStyle === 'brutal') {
      ctx.save();
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(contentX, contentY, contentW, contentH, borderRadius);
      } else {
        ctx.rect(contentX, contentY, contentW, contentH);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Step H: Draw Annotations
    const allAnnotations = currentShape ? [...annotations, currentShape] : annotations;

    allAnnotations.forEach((ann) => {
      ctx.save();
      if (ann.type === 'blur') {
        // True Pixelation Redaction
        const bx = Math.min(ann.x, ann.x + ann.w);
        const by = Math.min(ann.y, ann.y + ann.h);
        const bw = Math.abs(ann.w);
        const bh = Math.abs(ann.h);

        if (bw > 2 && bh > 2) {
          try {
            const blockSize = Math.max(6, Math.floor(Math.min(bw, bh) / 6));
            const smallW = Math.max(1, Math.floor(bw / blockSize));
            const smallH = Math.max(1, Math.floor(bh / blockSize));

            const offCanvas = document.createElement('canvas');
            offCanvas.width = smallW;
            offCanvas.height = smallH;
            const offCtx = offCanvas.getContext('2d');
            if (offCtx) {
              offCtx.drawImage(canvas, bx * scale, by * scale, bw * scale, bh * scale, 0, 0, smallW, smallH);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(offCanvas, 0, 0, smallW, smallH, bx, by, bw, bh);
              ctx.imageSmoothingEnabled = true;
            }
          } catch {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
            ctx.fillRect(bx, by, bw, bh);
          }

          // Subtle Privacy Outline & Badge
          ctx.strokeStyle = '#FFD93D';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(bx, by, bw, bh);
          ctx.setLineDash([]);
        }
      } else if (ann.type === 'box') {
        const bx = Math.min(ann.x, ann.x + ann.w);
        const by = Math.min(ann.y, ann.y + ann.h);
        const bw = Math.abs(ann.w);
        const bh = Math.abs(ann.h);

        ctx.fillStyle = `${ann.color}22`;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = ann.color || '#EF4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);
      } else if (ann.type === 'arrow') {
        const fromX = ann.x1;
        const fromY = ann.y1;
        const toX = ann.x2;
        const toY = ann.y2;
        const headlen = 16;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.strokeStyle = ann.color || '#EF4444';
        ctx.fillStyle = ann.color || '#EF4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (ann.type === 'text') {
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        const metrics = ctx.measureText(ann.text || '');
        const padX = 10;
        const padY = 6;
        const pillW = metrics.width + padX * 2;
        const pillH = 26;

        ctx.fillStyle = '#09090B';
        ctx.fillRect(ann.x + 2, ann.y + 2, pillW, pillH);

        ctx.fillStyle = ann.color === '#09090B' ? '#FFD93D' : ann.color || '#FFD93D';
        ctx.fillRect(ann.x, ann.y, pillW, pillH);
        ctx.strokeStyle = '#09090B';
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, pillW, pillH);

        ctx.fillStyle = '#09090B';
        ctx.textBaseline = 'middle';
        ctx.fillText(ann.text || '', ann.x + padX, ann.y + pillH / 2);
      }

      // Highlight Selected Annotation ONLY when in 'select' mode!
      if (activeTool === 'select' && ann.id === selectedAnnotationId) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        if (ann.type === 'arrow') {
          const minX = Math.min(ann.x1, ann.x2) - 8;
          const minY = Math.min(ann.y1, ann.y2) - 8;
          const w = Math.abs(ann.x2 - ann.x1) + 16;
          const h = Math.abs(ann.y2 - ann.y1) + 16;
          ctx.strokeRect(minX, minY, w, h);
        } else if (ann.type === 'text') {
          ctx.strokeRect(ann.x - 3, ann.y - 3, 100, 32);
        } else {
          ctx.strokeRect(
            Math.min(ann.x, ann.x + ann.w) - 4,
            Math.min(ann.y, ann.y + ann.h) - 4,
            Math.abs(ann.w) + 8,
            Math.abs(ann.h) + 8
          );
        }
        ctx.setLineDash([]);
      }

      ctx.restore();
    });

    // Restore tilt context
    ctx.restore();

    // Step I: Automatic Default Watermark (pre-filled with custom handle if saved)
    ctx.save();
    let savedWatermark = null;
    try {
      savedWatermark = typeof window !== 'undefined' ? localStorage.getItem('makeapost-default-watermark') : null;
    } catch {}
    const markText = savedWatermark ? `${savedWatermark} • made with makeapost.app` : 'made with makeapost.app';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
    const markMetrics = ctx.measureText(markText);
    const pillW = markMetrics.width + 20;
    const pillH = 26;
    const pillX = canvasW - pillW - 16;
    const pillY = canvasH - pillH - 14;

    // Hard Shadow
    ctx.fillStyle = '#09090B';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(pillX + 2, pillY + 2, pillW, pillH, 6);
    } else {
      ctx.rect(pillX + 2, pillY + 2, pillW, pillH);
    }
    ctx.fill();

    // Surface
    ctx.fillStyle = '#09090B';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(pillX, pillY, pillW, pillH, 6);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(markText, pillX + 10, pillY + pillH / 2);
    ctx.restore();

    ctx.restore();
  }, [
    canvasRef,
    image,
    aspectRatio,
    background,
    padding,
    borderRadius,
    shadow,
    frameStyle,
    windowTitle,
    tilt,
    ambientGlow,
    canvasBorder,
    verticalAlign,
    annotations,
    currentShape,
    activeTool,
    selectedAnnotationId,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // 3. Mouse & Touch Annotation Coordinate Math with Inverse Tilt Support
  const getCanvasPoint = (e) => {
    const canvas = canvasRef?.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = e.clientX ?? touch?.clientX ?? 0;
    const clientY = e.clientY ?? touch?.clientY ?? 0;
    const scaleX = parseFloat(canvas.style.width) / rect.width;
    const scaleY = parseFloat(canvas.style.height) / rect.height;

    let x = (clientX - rect.left) * scaleX;
    let y = (clientY - rect.top) * scaleY;

    // If canvas has tilt rotation, apply inverse rotation to point
    if (tilt !== 0) {
      const centerX = parseFloat(canvas.style.width) / 2;
      const centerY = parseFloat(canvas.style.height) / 2;
      const rad = (-tilt * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = x - centerX;
      const dy = y - centerY;
      x = centerX + (dx * cos - dy * sin);
      y = centerY + (dx * sin + dy * cos);
    }

    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (!image) return;
    const pt = getCanvasPoint(e);

    if (activeTool === 'select') {
      // Hit test existing annotations
      const clicked = [...annotations].reverse().find((ann) => {
        if (ann.type === 'arrow') {
          const minX = Math.min(ann.x1, ann.x2) - 10;
          const maxX = Math.max(ann.x1, ann.x2) + 10;
          const minY = Math.min(ann.y1, ann.y2) - 10;
          const maxY = Math.max(ann.y1, ann.y2) + 10;
          return pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
        } else if (ann.type === 'text') {
          return pt.x >= ann.x && pt.x <= ann.x + 120 && pt.y >= ann.y && pt.y <= ann.y + 35;
        } else {
          const bx = Math.min(ann.x, ann.x + ann.w);
          const by = Math.min(ann.y, ann.y + ann.h);
          const bw = Math.abs(ann.w);
          const bh = Math.abs(ann.h);
          return pt.x >= bx && pt.x <= bx + bw && pt.y >= by && pt.y <= by + bh;
        }
      });
      // Click on blank area deselects!
      onSelectAnnotation(clicked ? clicked.id : null);
      return;
    }

    // Any other tool deselects immediately
    if (onSelectAnnotation) onSelectAnnotation(null);

    if (activeTool === 'text') {
      setPendingTextPos(pt);
      setTextInputVal('');
      setTextPromptOpen(true);
      return;
    }

    if (activeTool === 'box' || activeTool === 'blur') {
      setIsDrawing(true);
      setCurrentShape({
        id: `ann_${Date.now()}`,
        type: activeTool,
        x: pt.x,
        y: pt.y,
        w: 0,
        h: 0,
        color: annotationColor,
      });
    } else if (activeTool === 'arrow') {
      setIsDrawing(true);
      setCurrentShape({
        id: `ann_${Date.now()}`,
        type: 'arrow',
        x1: pt.x,
        y1: pt.y,
        x2: pt.x,
        y2: pt.y,
        color: annotationColor,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentShape) return;
    const pt = getCanvasPoint(e);

    if (currentShape.type === 'box' || currentShape.type === 'blur') {
      setCurrentShape((prev) => (prev ? { ...prev, w: pt.x - prev.x, h: pt.y - prev.y } : null));
    } else if (currentShape.type === 'arrow') {
      setCurrentShape((prev) => (prev ? { ...prev, x2: pt.x, y2: pt.y } : null));
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return;
    setIsDrawing(false);

    // Filter out micro-clicks (< 6px)
    let isValid = false;
    if (currentShape.type === 'box' || currentShape.type === 'blur') {
      isValid = Math.abs(currentShape.w) > 6 && Math.abs(currentShape.h) > 6;
    } else if (currentShape.type === 'arrow') {
      const dist = Math.hypot(currentShape.x2 - currentShape.x1, currentShape.y2 - currentShape.y1);
      isValid = dist > 10;
    }

    if (isValid) {
      onAnnotationsChange([...annotations, currentShape]);
      // BUG FIX: Do NOT automatically set selectedAnnotationId, so no dashed box lingers!
    }
    setCurrentShape(null);
  };

  const handleAddTextSubmit = (e) => {
    e.preventDefault();
    if (textInputVal.trim().length > 0 && pendingTextPos) {
      const newAnn = {
        id: `ann_${Date.now()}`,
        type: 'text',
        x: pendingTextPos.x,
        y: pendingTextPos.y,
        text: textInputVal.trim(),
        color: annotationColor,
      };
      onAnnotationsChange([...annotations, newAnn]);
    }
    setTextPromptOpen(false);
    setPendingTextPos(null);
    setTextInputVal('');
  };

  // Click on background container deselects
  const handleContainerClick = (e) => {
    if (e.target === containerRef.current) {
      if (onSelectAnnotation) onSelectAnnotation(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        position: 'relative',
        padding: '24px',
        userSelect: 'none',
      }}
      className="dot-grid-bg"
    >
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* State 1: Empty Dropzone with Sample Demonstrations */}
      {!image ? (
        <div
          style={{
            maxWidth: '640px',
            width: '100%',
            padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 28px)',
            textAlign: 'center',
            backgroundColor: isDraggingOver ? 'var(--card-bg-subtle)' : 'var(--surface)',
            border: isDraggingOver ? '3px solid var(--accent-yellow)' : '2.5px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card-lg)',
            transition: 'background-color 0.15s ease',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--accent-yellow)',
              border: 'var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '3px 3px 0px var(--shadow-color)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <Camera size={26} style={{ color: '#09090B' }} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: '8px',
            }}
          >
            Drop Screenshot or Paste (Ctrl+V)
          </h2>

          <p
            style={{
              color: 'var(--muted)',
              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
              maxWidth: '440px',
              margin: '0 auto 20px',
              lineHeight: 1.5,
            }}
          >
            Paste any screenshot straight from your clipboard, drag and drop an
            image, or browse your files. 100% offline &amp; private.
          </p>

          <button
            type="button"
            className="btn-brutal btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.95rem', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderOpen size={16} />
            <span>Browse Image</span>
          </button>

          {/* Instant Sample Demos Strip */}
          <div
            style={{
              borderTop: '1.5px dashed var(--border-color)',
              paddingTop: '16px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '12px',
              }}
            >
              — OR TEST INSTANTLY WITH A DEMO SAMPLE —
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
              }}
            >
              <button
                type="button"
                className="btn-brutal"
                style={{
                  padding: '9px 12px',
                  fontSize: '0.8rem',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderColor: 'var(--border-color)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => loadFromDataUrl(SAMPLE_CODE_SVG)}
              >
                <Code2 size={15} />
                <span>Code Snippet Sample</span>
              </button>

              <button
                type="button"
                className="btn-brutal"
                style={{
                  padding: '9px 12px',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--card-bg-subtle)',
                  color: 'var(--ink)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => loadFromDataUrl(SAMPLE_ANALYTICS_SVG)}
              >
                <BarChart3 size={15} />
                <span>SaaS Analytics Sample</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* State 2: Active HTML5 Canvas Viewport with Touch Support */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={(e) => {
              if (activeTool !== 'select') e.preventDefault();
              handleMouseDown(e);
            }}
            onTouchMove={(e) => {
              if (activeTool !== 'select') e.preventDefault();
              handleMouseMove(e);
            }}
            onTouchEnd={handleMouseUp}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 150px)',
              objectFit: 'contain',
              cursor:
                activeTool === 'select'
                  ? 'default'
                  : activeTool === 'text'
                  ? 'text'
                  : 'crosshair',
              display: 'block',
              touchAction: activeTool === 'select' ? 'auto' : 'none',
            }}
          />
        </div>
      )}

      {/* Floating Modal for Text Annotation Input */}
      {textPromptOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--surface)',
            color: 'var(--ink)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card-lg)',
            padding: '20px 24px',
            zIndex: 100,
            width: '320px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1rem',
              marginBottom: '10px',
            }}
          >
            Add Text Callout
          </div>
          <form onSubmit={handleAddTextSubmit}>
            <input
              type="text"
              autoFocus
              className="input-brutal"
              placeholder="e.g. Look at this spike!"
              value={textInputVal}
              onChange={(e) => setTextInputVal(e.target.value)}
              style={{ marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-brutal"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setTextPromptOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brutal btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Add Callout
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
