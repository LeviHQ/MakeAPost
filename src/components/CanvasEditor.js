'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, FolderOpen, Code2, BarChart3, Move } from 'lucide-react';
import { AURA_PRESETS_MAP, drawAuraBackground } from '@/lib/backgroundPresets';

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function hitTestAnnotation(pt, ann) {
  if (!ann) return false;
  if (ann.type === 'arrow') {
    return distToSegment(pt.x, pt.y, ann.x1, ann.y1, ann.x2, ann.y2) <= 14;
  }
  if (ann.type === 'badge') {
    return Math.hypot(pt.x - ann.x, pt.y - ann.y) <= (ann.radius || 14) + 8;
  }
  if (ann.type === 'circle') {
    const cx = ann.x + ann.w / 2;
    const cy = ann.y + ann.h / 2;
    const rx = Math.max(8, Math.abs(ann.w) / 2 + 6);
    const ry = Math.max(8, Math.abs(ann.h) / 2 + 6);
    const dx = pt.x - cx;
    const dy = pt.y - cy;
    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.25;
  }
  if (ann.type === 'text') {
    const estW = Math.max(60, (ann.text || '').length * 9 + 24);
    return pt.x >= ann.x - 4 && pt.x <= ann.x + estW && pt.y >= ann.y - 4 && pt.y <= ann.y + 32;
  }
  const bx = Math.min(ann.x, ann.x + ann.w);
  const by = Math.min(ann.y, ann.y + ann.h);
  const bw = Math.abs(ann.w);
  const bh = Math.abs(ann.h);
  return pt.x >= bx - 6 && pt.x <= bx + bw + 6 && pt.y >= by - 6 && pt.y <= by + bh + 6;
}

function findTopAnnotationAt(pt, list) {
  return [...list].reverse().find((ann) => hitTestAnnotation(pt, ann)) || null;
}

function clampPan(x, y, zoom = 1) {
  const limit = Math.max(360, Math.round(450 * zoom));
  return {
    x: Math.max(-limit, Math.min(limit, Math.round(x))),
    y: Math.max(-limit, Math.min(limit, Math.round(y))),
  };
}

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
  watermark = 'made with makeapost.app',
  activeTool = 'select',
  annotationColor = '#EF4444',
  annotations = [],
  onAnnotationsChange,
  selectedAnnotationId,
  onSelectAnnotation,
  canvasRef,
  zoomScale = 1,
  onZoomChange,
  panOffset = { x: 0, y: 0 },
  onPanChange,
  isPanMode = false,
  canvasMaxHeight = 'calc(100vh - 150px)',
  disableFreeMovement = false,
}) {
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [textPromptOpen, setTextPromptOpen] = useState(false);
  const [pendingTextPos, setPendingTextPos] = useState(null);
  const [textInputVal, setTextInputVal] = useState('');
  const [isPinching, setIsPinching] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [hoveredSelected, setHoveredSelected] = useState(false);
  const [moveHint, setMoveHint] = useState(null);

  const pinchRef = useRef({
    startDist: 0,
    startZoom: 1,
    startMidX: 0,
    startMidY: 0,
    startPanX: 0,
    startPanY: 0,
    isPinching: false,
  });
  const pinchCooldownRef = useRef(0);
  const zoomScaleRef = useRef(zoomScale);
  zoomScaleRef.current = zoomScale;
  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;
  const isPanModeRef = useRef(isPanMode);
  isPanModeRef.current = isPanMode;
  const isSpacePressedRef = useRef(isSpacePressed);
  isSpacePressedRef.current = isSpacePressed;
  const hasImageRef = useRef(Boolean(image));
  hasImageRef.current = Boolean(image);

  const panDragRef = useRef({
    active: false,
    startClientX: 0,
    startClientY: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const lastClickRef = useRef({ time: 0, x: 0, y: 0 });
  const longPressTimerRef = useRef(null);
  const touchMetaRef = useRef({ startClientX: 0, startClientY: 0 });
  const moveHintTimerRef = useRef(null);

  const showMoveHint = useCallback((msg) => {
    setMoveHint(msg);
    if (moveHintTimerRef.current) clearTimeout(moveHintTimerRef.current);
    moveHintTimerRef.current = setTimeout(() => {
      setMoveHint(null);
    }, 1800);
  }, []);

  // Spacebar temporary Hand/Pan activation + timer cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    const handleBlur = () => {
      setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (moveHintTimerRef.current) clearTimeout(moveHintTimerRef.current);
    };
  }, []);

  // 1. Image Ingestion Helper
  const loadFromDataUrl = useCallback(
    (dataUrl, sampleId = null) => {
      const img = new Image();
      img.onload = () => {
        onImageLoaded({
          src: dataUrl,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 500,
          element: img,
          isSample: Boolean(sampleId),
          sampleId,
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
    } else if (AURA_PRESETS_MAP[background]) {
      drawAuraBackground(ctx, canvasW, canvasH, AURA_PRESETS_MAP[background]);
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

    // Step H: Draw Annotations (10 Tools: Select, Box, Circle, Arrow, Text, Blur, Zoom 2x, Highlight, Spotlight, Step Badges)
    let allAnnotations = currentShape ? [...annotations, currentShape] : annotations;
    if (dragOffset) {
      allAnnotations = allAnnotations.map((ann) => {
        if (ann.id !== dragOffset.id) return ann;
        if (ann.type === 'arrow') {
          return {
            ...ann,
            x1: ann.x1 + dragOffset.dx,
            y1: ann.y1 + dragOffset.dy,
            x2: ann.x2 + dragOffset.dx,
            y2: ann.y2 + dragOffset.dy,
          };
        } else {
          return {
            ...ann,
            x: ann.x + dragOffset.dx,
            y: ann.y + dragOffset.dy,
          };
        }
      });
    }

    // 1. Draw Spotlight Masks First (Dims entire content canvas with crisp cutouts over spotlighted areas)
    const spotlights = allAnnotations.filter((a) => a.type === 'spotlight');
    if (spotlights.length > 0) {
      ctx.save();
      ctx.beginPath();
      // Outer content frame
      ctx.rect(contentX, contentY, contentW, contentH);
      // Cutout rectangles for each spotlight
      spotlights.forEach((sp) => {
        const sbx = Math.min(sp.x, sp.x + sp.w);
        const sby = Math.min(sp.y, sp.y + sp.h);
        const sbw = Math.abs(sp.w);
        const sbh = Math.abs(sp.h);
        if (sbw > 4 && sbh > 4) {
          ctx.rect(sbx, sby, sbw, sbh);
        }
      });
      // Dim everything except the cutouts
      ctx.fillStyle = 'rgba(9, 9, 11, 0.58)';
      ctx.fill('evenodd');

      // Draw focus border and badge on each spotlight
      spotlights.forEach((sp) => {
        const sbx = Math.min(sp.x, sp.x + sp.w);
        const sby = Math.min(sp.y, sp.y + sp.h);
        const sbw = Math.abs(sp.w);
        const sbh = Math.abs(sp.h);
        if (sbw > 4 && sbh > 4) {
          ctx.strokeStyle = sp.color || '#FFD93D';
          ctx.lineWidth = 3;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(sbx, sby, sbw, sbh, 6);
            ctx.stroke();
          } else {
            ctx.strokeRect(sbx, sby, sbw, sbh);
          }
        }
      });
      ctx.restore();
    }

    // 2. Draw All Other Annotations
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

          // Subtle Privacy Outline
          ctx.strokeStyle = '#FFD93D';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(bx, by, bw, bh);
          ctx.setLineDash([]);
        }
      } else if (ann.type === 'zoom') {
        // High-Resolution 2x Loupe / Magnifier Lens
        const bx = Math.min(ann.x, ann.x + ann.w);
        const by = Math.min(ann.y, ann.y + ann.h);
        const bw = Math.abs(ann.w);
        const bh = Math.abs(ann.h);

        if (bw > 8 && bh > 8 && image?.element) {
          const cx = bx + bw / 2;
          const cy = by + bh / 2;

          const imgX = contentX;
          const imgY = contentY + titlebarHeight;
          const targetImgW = contentW;
          const targetImgH = contentH - titlebarHeight;

          const origScaleX = image.element.naturalWidth / targetImgW;
          const origScaleY = image.element.naturalHeight / targetImgH;

          const imgCx = (cx - imgX) * origScaleX;
          const imgCy = (cy - imgY) * origScaleY;

          const zoomFactor = 2.0;
          const srcW = (bw * origScaleX) / zoomFactor;
          const srcH = (bh * origScaleY) / zoomFactor;

          const srcX = Math.max(0, Math.min(image.element.naturalWidth - srcW, imgCx - srcW / 2));
          const srcY = Math.max(0, Math.min(image.element.naturalHeight - srcH, imgCy - srcH / 2));

          ctx.save();

          // Hard Neobrutalist Shadow for Zoom Loupe
          ctx.fillStyle = '#09090B';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(bx + 4, by + 4, bw, bh, 8);
            ctx.fill();
          } else {
            ctx.fillRect(bx + 4, by + 4, bw, bh);
          }

          // Rounded Clip for Magnified Image
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(bx, by, bw, bh, 8);
          } else {
            ctx.rect(bx, by, bw, bh);
          }
          ctx.clip();

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(bx, by, bw, bh);

          try {
            ctx.drawImage(image.element, srcX, srcY, srcW, srcH, bx, by, bw, bh);
          } catch {
            // fallback safe
          }
          ctx.restore();

          // Crisp Neobrutalist Border on Loupe
          ctx.strokeStyle = ann.color || '#FFD93D';
          ctx.lineWidth = 3.5;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 8);
            ctx.stroke();
          } else {
            ctx.strokeRect(bx, by, bw, bh);
          }

          // Corner "2x ZOOM" Tag
          if (bw > 55 && bh > 35) {
            const tagText = '2x ZOOM';
            ctx.font = '800 10px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
            const tMetrics = ctx.measureText(tagText);
            const tW = tMetrics.width + 10;
            const tH = 17;
            const tX = bx + bw - tW - 5;
            const tY = by + 5;

            ctx.fillStyle = '#09090B';
            ctx.fillRect(tX, tY, tW, tH);
            ctx.strokeStyle = ann.color || '#FFD93D';
            ctx.lineWidth = 1;
            ctx.strokeRect(tX, tY, tW, tH);

            ctx.fillStyle = '#FFD93D';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tagText, tX + tW / 2, tY + tH / 2);
          }

          ctx.restore();
        }
      } else if (ann.type === 'highlighter') {
        // Translucent Fluorescent Marker Highlight
        const bx = Math.min(ann.x, ann.x + ann.w);
        const by = Math.min(ann.y, ann.y + ann.h);
        const bw = Math.abs(ann.w);
        const bh = Math.abs(ann.h);

        if (bw > 2 && bh > 2) {
          ctx.save();
          ctx.globalAlpha = 0.42;
          ctx.fillStyle = ann.color || '#FFD93D';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 4);
            ctx.fill();
          } else {
            ctx.fillRect(bx, by, bw, bh);
          }
          ctx.restore();
        }
      } else if (ann.type === 'circle') {
        // Circular / Oval Callout
        const bx = Math.min(ann.x, ann.x + ann.w);
        const by = Math.min(ann.y, ann.y + ann.h);
        const bw = Math.abs(ann.w);
        const bh = Math.abs(ann.h);

        if (bw > 2 && bh > 2) {
          const cx = bx + bw / 2;
          const cy = by + bh / 2;
          const rx = bw / 2;
          const ry = bh / 2;

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${ann.color || '#EF4444'}18`;
          ctx.fill();
          ctx.strokeStyle = ann.color || '#EF4444';
          ctx.lineWidth = 3.5;
          ctx.stroke();
          ctx.restore();
        }
      } else if (ann.type === 'badge') {
        // Tactile Numbered Step Counter Badge (1, 2, 3...)
        const r = ann.radius || 14;
        ctx.save();

        // Neobrutalist Hard Offset Shadow
        ctx.beginPath();
        ctx.arc(ann.x + 2, ann.y + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = '#09090B';
        ctx.fill();

        // Badge Surface Circle
        ctx.beginPath();
        ctx.arc(ann.x, ann.y, r, 0, Math.PI * 2);
        ctx.fillStyle = ann.color === '#09090B' ? '#FFD93D' : (ann.color || '#FFD93D');
        ctx.fill();

        // Bold Outer Border
        ctx.strokeStyle = '#09090B';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Step Number Text
        ctx.fillStyle = '#09090B';
        ctx.font = '800 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(ann.step || 1), ann.x, ann.y + 0.5);
        ctx.restore();
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

      // Highlight Selected Annotation (works in Select mode or via Double-Click / Long-Press)
      if (ann.id === selectedAnnotationId) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        if (ann.type === 'arrow') {
          const minX = Math.min(ann.x1, ann.x2) - 8;
          const minY = Math.min(ann.y1, ann.y2) - 8;
          const w = Math.abs(ann.x2 - ann.x1) + 16;
          const h = Math.abs(ann.y2 - ann.y1) + 16;
          ctx.strokeRect(minX, minY, w, h);
        } else if (ann.type === 'badge') {
          ctx.beginPath();
          ctx.arc(ann.x, ann.y, (ann.radius || 14) + 6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ann.type === 'text') {
          ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          const textW = ctx.measureText(ann.text || '').width + 26;
          ctx.strokeRect(ann.x - 3, ann.y - 3, textW, 32);
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

    // Watermark Badge (Default, Custom Brand Handle, or Hidden)
    const activeWatermark = typeof watermark === 'string' ? watermark.trim() : 'made with makeapost.app';
    if (activeWatermark && activeWatermark !== 'none' && activeWatermark !== 'hide') {
      ctx.save();
      const markText = activeWatermark;
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
    }

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
    watermark,
    annotations,
    currentShape,
    dragOffset,
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

  const startPanDrag = useCallback((clientX, clientY) => {
    if (disableFreeMovement) return;
    panDragRef.current = {
      active: true,
      startClientX: clientX,
      startClientY: clientY,
      startPanX: panOffsetRef.current.x,
      startPanY: panOffsetRef.current.y,
    };
    setIsPanning(true);
  }, [disableFreeMovement]);

  const commitDragState = useCallback(() => {
    if (!dragState) return false;
    if (dragOffset && (Math.abs(dragOffset.dx) > 1 || Math.abs(dragOffset.dy) > 1)) {
      const finalAnnotations = annotations.map((ann) => {
        if (ann.id !== dragState.id) return ann;
        if (ann.type === 'arrow') {
          return {
            ...ann,
            x1: dragState.origAnn.x1 + dragOffset.dx,
            y1: dragState.origAnn.y1 + dragOffset.dy,
            x2: dragState.origAnn.x2 + dragOffset.dx,
            y2: dragState.origAnn.y2 + dragOffset.dy,
          };
        }
        return {
          ...ann,
          x: dragState.origAnn.x + dragOffset.dx,
          y: dragState.origAnn.y + dragOffset.dy,
        };
      });
      onAnnotationsChange(finalAnnotations);
    }
    setDragState(null);
    setDragOffset(null);
    return true;
  }, [dragState, dragOffset, annotations, onAnnotationsChange]);

  const handleMouseDown = (e) => {
    if (!image) return;
    if (Date.now() < pinchCooldownRef.current) return;
    e.stopPropagation();

    // Pan Mode, Spacebar+Drag, or Middle Mouse Drag
    if (e.button === 1 || isSpacePressedRef.current || isPanModeRef.current) {
      e.preventDefault();
      startPanDrag(e.clientX, e.clientY);
      return;
    }

    const pt = getCanvasPoint(e);
    const now = Date.now();
    const isDoubleClick =
      now - lastClickRef.current.time < 350 &&
      Math.hypot(e.clientX - lastClickRef.current.x, e.clientY - lastClickRef.current.y) < 12;
    lastClickRef.current = { time: now, x: e.clientX, y: e.clientY };

    const clicked = findTopAnnotationAt(pt, annotations);

    if (activeTool === 'select') {
      onSelectAnnotation?.(clicked ? clicked.id : null);
      if (clicked) {
        setDragState({
          id: clicked.id,
          startPt: pt,
          origAnn: { ...clicked },
        });
      } else {
        // Dragging blank space in Select mode smoothly pans canvas
        startPanDrag(e.clientX, e.clientY);
      }
      return;
    }

    // Desktop Double-Click on ANY annotation, or dragging an already-selected annotation
    if (clicked && (isDoubleClick || clicked.id === selectedAnnotationId)) {
      setIsDrawing(false);
      setCurrentShape(null);
      if (onSelectAnnotation) onSelectAnnotation(clicked.id);
      setDragState({
        id: clicked.id,
        startPt: pt,
        origAnn: { ...clicked },
      });
      if (isDoubleClick) {
        showMoveHint('Selected — drag to reposition');
      }
      return;
    }

    // Clicking empty space or another unselected region deselects & uses active drawing tool
    if (onSelectAnnotation) onSelectAnnotation(null);

    if (activeTool === 'text') {
      setPendingTextPos(pt);
      setTextInputVal('');
      setTextPromptOpen(true);
      return;
    }

    if (activeTool === 'badge') {
      const badgeCount = annotations.filter((a) => a.type === 'badge').length;
      const newBadge = {
        id: `ann_${Date.now()}`,
        type: 'badge',
        x: pt.x,
        y: pt.y,
        step: badgeCount + 1,
        radius: 14,
        color: annotationColor || '#FFD93D',
      };
      onAnnotationsChange([...annotations, newBadge]);
      return;
    }

    const SHAPE_TOOLS = ['box', 'blur', 'zoom', 'circle', 'highlighter', 'spotlight'];
    if (SHAPE_TOOLS.includes(activeTool)) {
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
    // 1. Canvas Panning
    if (panDragRef.current.active) {
      const dx = e.clientX - panDragRef.current.startClientX;
      const dy = e.clientY - panDragRef.current.startClientY;
      if (onPanChange) {
        onPanChange(
          clampPan(
            panDragRef.current.startPanX + dx,
            panDragRef.current.startPanY + dy,
            zoomScaleRef.current
          )
        );
      }
      return;
    }

    // 2. Repositioning Annotation (Select mode, Double-click drag, or Long-press drag)
    if (dragState) {
      const pt = getCanvasPoint(e);
      const dx = pt.x - dragState.startPt.x;
      const dy = pt.y - dragState.startPt.y;
      setDragOffset({ id: dragState.id, dx, dy });
      return;
    }

    // 3. Active Drawing
    if (isDrawing && currentShape) {
      const pt = getCanvasPoint(e);
      const SHAPE_TOOLS = ['box', 'blur', 'zoom', 'circle', 'highlighter', 'spotlight'];
      if (SHAPE_TOOLS.includes(currentShape.type)) {
        setCurrentShape((prev) => (prev ? { ...prev, w: pt.x - prev.x, h: pt.y - prev.y } : null));
      } else if (currentShape.type === 'arrow') {
        setCurrentShape((prev) => (prev ? { ...prev, x2: pt.x, y2: pt.y } : null));
      }
      return;
    }

    // 4. Hover cursor hint when over an already-selected annotation
    if (image && selectedAnnotationId && e.clientX !== undefined) {
      const pt = getCanvasPoint(e);
      const hit = findTopAnnotationAt(pt, annotations);
      const overSel = Boolean(hit && hit.id === selectedAnnotationId);
      setHoveredSelected((prev) => (prev !== overSel ? overSel : prev));
    } else if (hoveredSelected) {
      setHoveredSelected(false);
    }
  };

  const handleMouseUp = useCallback(() => {
    if (panDragRef.current.active) {
      panDragRef.current.active = false;
      setIsPanning(false);
      return;
    }

    if (commitDragState()) {
      return;
    }

    if (!isDrawing || !currentShape) return;
    setIsDrawing(false);

    let isValid = false;
    const SHAPE_TOOLS = ['box', 'blur', 'zoom', 'circle', 'highlighter', 'spotlight'];
    if (SHAPE_TOOLS.includes(currentShape.type)) {
      isValid = Math.abs(currentShape.w) > 6 && Math.abs(currentShape.h) > 6;
    } else if (currentShape.type === 'arrow') {
      const dist = Math.hypot(currentShape.x2 - currentShape.x1, currentShape.y2 - currentShape.y1);
      isValid = dist > 10;
    }

    if (isValid) {
      onAnnotationsChange([...annotations, currentShape]);
    }
    setCurrentShape(null);
  }, [commitDragState, isDrawing, currentShape, annotations, onAnnotationsChange]);

  // Safety listener if mouse is released outside container
  useEffect(() => {
    if (!isPanning && !dragState && !isDrawing) return;
    const onWinUp = () => handleMouseUp();
    window.addEventListener('mouseup', onWinUp);
    return () => window.removeEventListener('mouseup', onWinUp);
  }, [isPanning, dragState, isDrawing, handleMouseUp]);

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

  // Clicking/dragging background dotted container outside canvas deselects and pans
  const handleContainerMouseDown = (e) => {
    if (e.target === containerRef.current) {
      if (onSelectAnnotation) onSelectAnnotation(null);
      if (image && (e.button === 0 || e.button === 1)) {
        startPanDrag(e.clientX, e.clientY);
      }
    }
  };

  // Touch Handlers for Canvas (1-Finger Drawing, Long-Press Move, and Panning)
  const handleTouchStart = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (e.touches.length >= 2 || pinchRef.current.isPinching || Date.now() < pinchCooldownRef.current) {
      setIsDrawing(false);
      setCurrentShape(null);
      setDragState(null);
      setDragOffset(null);
      panDragRef.current.active = false;
      setIsPanning(false);
      touchMetaRef.current = { pendingDraw: false };
      return;
    }

    if (!image) return;
    const touch = e.touches[0];
    if (!touch) return;

    if (isPanModeRef.current) {
      e.preventDefault();
      startPanDrag(touch.clientX, touch.clientY);
      return;
    }

    const pt = getCanvasPoint(e);
    const hit = findTopAnnotationAt(pt, annotations);

    if (activeTool === 'select') {
      e.preventDefault();
      onSelectAnnotation(hit ? hit.id : null);
      if (hit) {
        setDragState({
          id: hit.id,
          startPt: pt,
          origAnn: { ...hit },
        });
      } else {
        startPanDrag(touch.clientX, touch.clientY);
      }
      return;
    }

    // Touching an already-selected annotation drags it directly
    if (hit && hit.id === selectedAnnotationId) {
      e.preventDefault();
      setDragState({
        id: hit.id,
        startPt: pt,
        origAnn: { ...hit },
      });
      return;
    }

    // Drawing tool active: prevent scrolling and monitor for Long-Press if finger hits an existing annotation
    e.preventDefault();
    if (onSelectAnnotation) onSelectAnnotation(null);

    if (hit) {
      touchMetaRef.current = {
        startClientX: touch.clientX,
        startClientY: touch.clientY,
        startPt: pt,
        pendingDraw: true,
        longPressed: false,
      };
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        touchMetaRef.current.pendingDraw = false;
        touchMetaRef.current.longPressed = true;
        setIsDrawing(false);
        setCurrentShape(null);
        if (onSelectAnnotation) onSelectAnnotation(hit.id);
        setDragState({
          id: hit.id,
          startPt: pt,
          origAnn: { ...hit },
        });
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
        showMoveHint('Selected — drag to move');
      }, 360);
      return;
    }

    touchMetaRef.current = { pendingDraw: false, longPressed: false };
    handleMouseDown(e);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length >= 2 || pinchRef.current.isPinching || Date.now() < pinchCooldownRef.current) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      return;
    }

    const touch = e.touches[0];
    if (!touch) return;

    if (panDragRef.current.active) {
      e.preventDefault();
      const dx = touch.clientX - panDragRef.current.startClientX;
      const dy = touch.clientY - panDragRef.current.startClientY;
      if (onPanChange) {
        onPanChange(
          clampPan(
            panDragRef.current.startPanX + dx,
            panDragRef.current.startPanY + dy,
            zoomScaleRef.current
          )
        );
      }
      return;
    }

    // If finger moved > 10px before long-press triggered, user intends to draw a new shape!
    if (touchMetaRef.current.pendingDraw) {
      const distMoved = Math.hypot(
        touch.clientX - touchMetaRef.current.startClientX,
        touch.clientY - touchMetaRef.current.startClientY
      );
      if (distMoved > 10) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        touchMetaRef.current.pendingDraw = false;
        const startPt = touchMetaRef.current.startPt;
        const curPt = getCanvasPoint(e);
        const SHAPE_TOOLS = ['box', 'blur', 'zoom', 'circle', 'highlighter', 'spotlight'];
        if (SHAPE_TOOLS.includes(activeTool)) {
          setIsDrawing(true);
          setCurrentShape({
            id: `ann_${Date.now()}`,
            type: activeTool,
            x: startPt.x,
            y: startPt.y,
            w: curPt.x - startPt.x,
            h: curPt.y - startPt.y,
            color: annotationColor,
          });
        } else if (activeTool === 'arrow') {
          setIsDrawing(true);
          setCurrentShape({
            id: `ann_${Date.now()}`,
            type: 'arrow',
            x1: startPt.x,
            y1: startPt.y,
            x2: curPt.x,
            y2: curPt.y,
            color: annotationColor,
          });
        }
      }
      return;
    }

    e.preventDefault();
    handleMouseMove(e);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (pinchRef.current.isPinching) {
      return;
    }

    // If quick tap on text/badge over an existing annotation before long-press fired
    if (touchMetaRef.current.pendingDraw && !touchMetaRef.current.longPressed) {
      const startPt = touchMetaRef.current.startPt;
      touchMetaRef.current.pendingDraw = false;
      if (activeTool === 'text') {
        setPendingTextPos(startPt);
        setTextInputVal('');
        setTextPromptOpen(true);
        return;
      }
      if (activeTool === 'badge') {
        const badgeCount = annotations.filter((a) => a.type === 'badge').length;
        const newBadge = {
          id: `ann_${Date.now()}`,
          type: 'badge',
          x: startPt.x,
          y: startPt.y,
          step: badgeCount + 1,
          radius: 14,
          color: annotationColor || '#FFD93D',
        };
        onAnnotationsChange([...annotations, newBadge]);
        return;
      }
    }

    touchMetaRef.current = { pendingDraw: false, longPressed: false };
    handleMouseUp();
  };

  // Native Non-Passive Event Listeners for 2-Finger Pinch-to-Zoom + 2-Finger Pan & Wheel Pan/Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disableFreeMovement) return;

    const handleTouchStartNative = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        pinchRef.current = {
          startDist: dist,
          startZoom: zoomScaleRef.current,
          startMidX: midX,
          startMidY: midY,
          startPanX: panOffsetRef.current.x,
          startPanY: panOffsetRef.current.y,
          isPinching: true,
        };
        setIsPinching(true);
        setIsDrawing(false);
        setCurrentShape(null);
        setDragState(null);
        setDragOffset(null);
        panDragRef.current.active = false;
        setIsPanning(false);
      }
    };

    const handleTouchMoveNative = (e) => {
      if (e.touches.length === 2 && pinchRef.current.isPinching) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const curMidX = (t1.clientX + t2.clientX) / 2;
        const curMidY = (t1.clientY + t2.clientY) / 2;

        let nextZoom = zoomScaleRef.current;
        if (pinchRef.current.startDist > 0 && onZoomChange) {
          const ratio = currentDist / pinchRef.current.startDist;
          nextZoom = Number(Math.min(3.0, Math.max(0.4, pinchRef.current.startZoom * ratio)).toFixed(2));
          onZoomChange(nextZoom);
        }

        if (onPanChange) {
          const dx = curMidX - pinchRef.current.startMidX;
          const dy = curMidY - pinchRef.current.startMidY;
          onPanChange(
            clampPan(
              pinchRef.current.startPanX + dx,
              pinchRef.current.startPanY + dy,
              nextZoom
            )
          );
        }
      }
    };

    const handleTouchEndNative = (e) => {
      if (pinchRef.current.isPinching && e.touches.length < 2) {
        pinchRef.current.isPinching = false;
        setIsPinching(false);
        pinchCooldownRef.current = Date.now() + 250;
      }
    };

    const handleWheelNative = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.005;
        if (onZoomChange) {
          onZoomChange((prev) => {
            const next = Math.min(3.0, Math.max(0.4, prev + zoomDelta));
            return Number(next.toFixed(2));
          });
        }
      } else if (hasImageRef.current && onPanChange) {
        // Trackpad 2-finger swipe or mouse wheel smoothly pans the canvas inside the 70% area
        e.preventDefault();
        onPanChange((prev) =>
          clampPan(prev.x - e.deltaX, prev.y - e.deltaY, zoomScaleRef.current)
        );
      }
    };

    container.addEventListener('touchstart', handleTouchStartNative, { passive: false });
    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    container.addEventListener('touchend', handleTouchEndNative, { passive: false });
    container.addEventListener('wheel', handleWheelNative, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStartNative);
      container.removeEventListener('touchmove', handleTouchMoveNative);
      container.removeEventListener('touchend', handleTouchEndNative);
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, [onZoomChange, onPanChange, disableFreeMovement]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
        overflow: image ? 'hidden' : 'auto',
        position: 'relative',
        padding: '24px',
        userSelect: 'none',
        cursor: isPanning ? 'grabbing' : isPanMode || isSpacePressed ? 'grab' : undefined,
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
                onClick={() => loadFromDataUrl(SAMPLE_CODE_SVG, 'code')}
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
                onClick={() => loadFromDataUrl(SAMPLE_ANALYTICS_SVG, 'analytics')}
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              maxWidth: '100%',
              maxHeight: canvasMaxHeight,
              objectFit: 'contain',
              cursor: isPanning
                ? 'grabbing'
                : isPanMode || isSpacePressed
                ? 'grab'
                : dragState
                ? 'grabbing'
                : hoveredSelected
                ? 'move'
                : activeTool === 'select'
                ? disableFreeMovement
                  ? 'default'
                  : 'grab'
                : activeTool === 'text'
                ? 'text'
                : activeTool === 'badge'
                ? 'pointer'
                : 'crosshair',
              display: 'block',
              touchAction: 'none',
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomScale})`,
              transformOrigin: 'center center',
              transition:
                isPinching || isPanning || dragState
                  ? 'none'
                  : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          />

          {/* Floating Non-Intrusive Pill when Annotation Move Mode Activates */}
          {moveHint ? (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#09090B',
                color: '#FFFFFF',
                border: '2px solid #FFD93D',
                borderRadius: '999px',
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 50,
                pointerEvents: 'none',
                boxShadow: '2px 2px 0px #000000',
              }}
            >
              <Move size={13} style={{ color: '#FFD93D' }} />
              <span>{moveHint}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Floating Modal for Text Annotation Input */}
      {textPromptOpen ? (
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
      ) : null}
    </div>
  );
}
