'use client';

import { useState, useEffect } from 'react';
import { GRADIENT_PRESETS, SOLID_PRESETS } from './CanvasEditor';
import { AURA_BACKGROUND_PRESETS, AURA_PRESETS_MAP, getAuraCssStyle } from '@/lib/backgroundPresets';
import AiStudio from './AiStudio';
import {
  Palette,
  Sparkles,
  MousePointer,
  Square,
  Circle,
  ArrowUpRight,
  EyeOff,
  Type,
  ZoomIn,
  Highlighter,
  Focus,
  ListOrdered,
  Trash2,
  ArrowRight,
  X,
  Check,
} from 'lucide-react';

export default function ModeSidebar({
  activeMode,
  onModeChange,
  canvasRef,
  image,
  // Section 1: Aspect Ratio
  aspectRatio,
  onAspectRatioChange,
  // Section 2: Frame & Styling
  frameStyle,
  onFrameStyleChange,
  padding,
  onPaddingChange,
  borderRadius,
  onBorderRadiusChange,
  shadow,
  onShadowChange,
  // Section 3: Annotations & Highlights
  activeTool,
  onToolChange,
  annotationColor,
  onAnnotationColorChange,
  annotations,
  onClearAnnotations,
  selectedAnnotationId,
  onDeleteSelectedAnnotation,
  // Section 4: Backgrounds
  background,
  onBackgroundChange,
  // Section 5: Core & Pro Configurations (Underrated Studio Settings)
  tilt,
  onTiltChange,
  windowTitle,
  onWindowTitleChange,
  ambientGlow,
  onAmbientGlowChange,
  canvasBorder,
  onCanvasBorderChange,
  verticalAlign,
  onVerticalAlignChange,
  watermark = 'made with makeapost.site',
  onWatermarkChange,
  customAiNode = null,
  isDemo = false,
  planId = 'free',
  onLockedFeatureClick,
  aiProps = {},
}) {
  const [showBgModal, setShowBgModal] = useState(false);
  const [bgCategory, setBgCategory] = useState('All');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    if (!showBgModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowBgModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBgModal]);

  const filteredAuraPresets = bgCategory === 'All'
    ? AURA_BACKGROUND_PRESETS
    : AURA_BACKGROUND_PRESETS.filter((p) => p.category === bgCategory);

  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--surface)',
        borderRight: 'var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* 1. Sticky Mode Switcher Pill */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'var(--surface)',
          padding: '14px 16px',
          borderBottom: 'var(--border)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            padding: '4px',
            backgroundColor: 'var(--card-bg-subtle)',
            border: 'var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '2px 2px 0px var(--shadow-color)',
          }}
        >
          <button
            type="button"
            disabled={isAiGenerating}
            className="btn-brutal"
            style={{
              padding: '8px 10px',
              fontSize: '0.84rem',
              backgroundColor: activeMode === 'editor' ? 'var(--accent-yellow)' : 'transparent',
              color: activeMode === 'editor' ? '#09090B' : 'var(--ink)',
              boxShadow: activeMode === 'editor' ? '2px 2px 0px var(--shadow-color)' : 'none',
              border: activeMode === 'editor' ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: isAiGenerating ? 0.6 : 1,
              cursor: isAiGenerating ? 'not-allowed' : 'pointer',
            }}
            onClick={() => onModeChange('editor')}
          >
            <Palette size={14} />
            <span>1. Editor</span>
          </button>

          <button
            type="button"
            disabled={isAiGenerating}
            className="btn-brutal"
            style={{
              padding: '8px 10px',
              fontSize: '0.84rem',
              backgroundColor: activeMode === 'ai' ? 'var(--accent-yellow)' : 'transparent',
              color: activeMode === 'ai' ? '#09090B' : 'var(--ink)',
              boxShadow: activeMode === 'ai' ? '2px 2px 0px var(--shadow-color)' : 'none',
              border: activeMode === 'ai' ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: isAiGenerating ? 0.6 : 1,
              cursor: isAiGenerating ? 'not-allowed' : 'pointer',
            }}
            onClick={() => onModeChange('ai')}
          >
            <Sparkles size={14} />
            <span>2. AI Mode</span>
          </button>
        </div>
      </div>

      {/* 2. Body Area Based on State */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* State A: Fresh Mode Selection (No mode clicked yet) */}
        {activeMode === 'fresh' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                fontWeight: 800,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Choose Workspace Mode
            </div>

            {/* Card 1: Image Editor */}
            <div
              className="card-brutal"
              style={{
                padding: '20px 18px',
                cursor: 'pointer',
                backgroundColor: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
              onClick={() => onModeChange('editor')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Palette size={26} style={{ color: 'var(--ink)' }} />
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.7rem' }}>
                  100% Free
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>
                1. Image Editor
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                Beautify screenshots with macOS titlebars, gradients, 3D tilt, and blur out sensitive tokens.
              </p>
              <button
                type="button"
                className="btn-brutal btn-primary"
                style={{ marginTop: '8px', padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Launch Image Editor</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: AI Post Mode */}
            <div
              className="card-brutal"
              style={{
                padding: '20px 18px',
                cursor: 'pointer',
                backgroundColor: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
              onClick={() => onModeChange('ai')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Sparkles size={26} style={{ color: 'var(--ink)' }} />
                <span className="badge-brutal badge-blue" style={{ fontSize: '0.7rem' }}>
                  Multimodal AI
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>
                2. AI Post Mode
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                Multimodal Gemini AI reads your visual screenshot and writes high-engagement posts for X, LinkedIn, and Reddit.
              </p>
              <button
                type="button"
                className="btn-brutal btn-secondary"
                style={{ marginTop: '8px', padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Open AI Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* State B: AI Post Mode Studio (Kept mounted to preserve generated posts across mode toggles) */}
        <div style={{ display: activeMode === 'ai' ? 'block' : 'none' }}>
          {customAiNode || (
            <AiStudio
              canvasRef={canvasRef}
              image={image}
              onSwitchToEditor={() => onModeChange('editor')}
              onGeneratingChange={setIsAiGenerating}
              {...aiProps}
            />
          )}
        </div>

        {/* State C: Active Image Editor Controls (Reordered & Enhanced) */}
        <div style={{ display: activeMode === 'editor' ? 'flex' : 'none', flexDirection: 'column', gap: '18px' }}>
            {/* 1. Aspect Ratio */}
            <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  1. Aspect Ratio
                </span>
                <span className="tag-mono">{aspectRatio}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {['auto', '16:9', '1:1', '4:5', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    className="btn-brutal"
                    style={{
                      minWidth: 0,
                      padding: '6px 2px',
                      fontSize: '0.72rem',
                      backgroundColor: aspectRatio === ratio ? 'var(--accent-blue)' : 'var(--card-bg-subtle)',
                      color: aspectRatio === ratio ? '#09090B' : 'var(--ink)',
                      boxShadow: aspectRatio === ratio ? '2px 2px 0px var(--shadow-color)' : 'none',
                      border: '1.5px solid var(--border-color)',
                    }}
                    onClick={() => onAspectRatioChange(ratio)}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Frame & Styling (Moved Up) */}
            <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                2. Frame &amp; Styling
              </div>

              {/* Frame Style Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {[
                  { id: 'none', label: 'None' },
                  { id: 'macos', label: 'macOS' },
                  { id: 'brutal', label: 'Neobrutal' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className="btn-brutal"
                    style={{
                      padding: '6px 4px',
                      fontSize: '0.75rem',
                      backgroundColor: frameStyle === st.id ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      color: frameStyle === st.id ? '#09090B' : 'var(--ink)',
                      boxShadow: frameStyle === st.id ? '2px 2px 0px var(--shadow-color)' : 'none',
                      border: '1.5px solid var(--border-color)',
                    }}
                    onClick={() => onFrameStyleChange(st.id)}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Padding Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>Canvas Padding</span>
                  <span className="tag-mono">{padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={padding}
                  onChange={(e) => onPaddingChange(Number(e.target.value))}
                  className="slider-brutal"
                />
              </div>

              {/* Border Radius Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>Corner Radius</span>
                  <span className="tag-mono">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={borderRadius}
                  onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
                  className="slider-brutal"
                />
              </div>

              {/* Shadow Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>Drop Shadow</span>
                  <span className="tag-mono">{shadow}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={shadow}
                  onChange={(e) => onShadowChange(Number(e.target.value))}
                  className="slider-brutal"
                />
              </div>
            </div>

            {/* 3. Annotation Tools (Draw directly on canvas) */}
            <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  3. Annotations ({annotations.length})
                </span>
                {annotations.length > 0 && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={onClearAnnotations}
                  >
                    <Trash2 size={12} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Tool Buttons (5 in Demo, 10 Comprehensive Studio Tools in Full Editor) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {(isDemo
                  ? [
                      { id: 'select', label: 'Pointer', renderIcon: () => <MousePointer size={15} /> },
                      { id: 'box', label: 'Box', renderIcon: () => <Square size={15} /> },
                      { id: 'arrow', label: 'Arrow', renderIcon: () => <ArrowUpRight size={16} /> },
                      { id: 'text', label: 'Text', renderIcon: () => <Type size={15} /> },
                      { id: 'blur', label: 'Blur', renderIcon: () => <EyeOff size={15} /> },
                    ]
                  : [
                      { id: 'select', label: 'Pointer', renderIcon: () => <MousePointer size={15} /> },
                      { id: 'box', label: 'Box', renderIcon: () => <Square size={15} /> },
                      { id: 'circle', label: 'Circle', renderIcon: () => <Circle size={15} /> },
                      { id: 'arrow', label: 'Arrow', renderIcon: () => <ArrowUpRight size={16} /> },
                      { id: 'text', label: 'Text', renderIcon: () => <Type size={15} /> },
                      { id: 'blur', label: 'Blur', renderIcon: () => <EyeOff size={15} /> },
                      { id: 'zoom', label: 'Zoom 2x', renderIcon: () => <ZoomIn size={15} /> },
                      { id: 'highlighter', label: 'Highlight', renderIcon: () => <Highlighter size={15} /> },
                      { id: 'spotlight', label: 'Spotlight', renderIcon: () => <Focus size={15} /> },
                      { id: 'badge', label: 'Step 123', renderIcon: () => <ListOrdered size={15} /> },
                    ]
                ).map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    className="btn-brutal"
                    title={tool.label}
                    style={{
                      minWidth: 0,
                      padding: '7px 2px',
                      fontSize: '0.72rem',
                      backgroundColor: activeTool === tool.id ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      color: activeTool === tool.id ? '#09090B' : 'var(--ink)',
                      boxShadow: activeTool === tool.id ? '2px 2px 0px var(--shadow-color)' : 'none',
                      border: '1.5px solid var(--border-color)',
                      flexDirection: 'column',
                      gap: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => onToolChange(tool.id)}
                  >
                    <span>{tool.renderIcon()}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Micro-Hint for Active Tool */}
              <div
                style={{
                  backgroundColor: 'var(--card-bg-subtle)',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.72rem',
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {activeTool === 'zoom' && <><ZoomIn size={13} style={{ flexShrink: 0 }} /><span><strong>Zoom 2x:</strong> Drag a box over any detail or code snippet to magnify it 2x.</span></>}
                {activeTool === 'spotlight' && <><Focus size={13} style={{ flexShrink: 0 }} /><span><strong>Spotlight:</strong> Drag a box to dim the surrounding image and focus attention.</span></>}
                {activeTool === 'highlighter' && <><Highlighter size={13} style={{ flexShrink: 0 }} /><span><strong>Highlighter:</strong> Drag across text or lines to apply a fluorescent translucent tint.</span></>}
                {activeTool === 'badge' && <><ListOrdered size={13} style={{ flexShrink: 0 }} /><span><strong>Step Badges:</strong> Click anywhere on canvas to drop numbered steps (1, 2, 3...).</span></>}
                {activeTool === 'circle' && <><Circle size={13} style={{ flexShrink: 0 }} /><span><strong>Circle:</strong> Drag diagonally to create an oval or circular highlight callout.</span></>}
                {activeTool === 'blur' && <><EyeOff size={13} style={{ flexShrink: 0 }} /><span><strong>Blur:</strong> Drag a box over sensitive API keys, passwords, or emails to redact.</span></>}
                {activeTool === 'box' && <><Square size={13} style={{ flexShrink: 0 }} /><span><strong>Box:</strong> Drag diagonally to frame important UI sections with a colored border.</span></>}
                {activeTool === 'arrow' && <><ArrowUpRight size={13} style={{ flexShrink: 0 }} /><span><strong>Arrow:</strong> Drag from start to end to point directly at a feature or button.</span></>}
                {activeTool === 'text' && <><Type size={13} style={{ flexShrink: 0 }} /><span><strong>Text:</strong> Click anywhere on canvas to write a custom Neobrutalist pill note.</span></>}
                {activeTool === 'select' && <><MousePointer size={13} style={{ flexShrink: 0 }} /><span><strong>Pointer:</strong> Click and drag any annotation to reposition, or select to delete.</span></>}
              </div>

              {/* Color Picker for Annotations (6 Vibrant Neobrutal Presets) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Tool Color:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#EF4444', '#FFD93D', '#10B981', '#38BDF8', '#8B5CF6', '#09090B'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => onAnnotationColorChange(col)}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: col,
                        border: annotationColor === col ? '2.5px solid var(--ink)' : '1.5px solid var(--muted-light)',
                        transform: annotationColor === col ? 'scale(1.15)' : 'none',
                        cursor: 'pointer',
                        boxShadow: annotationColor === col ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Micro-hint for Double-Click / Long-Press Move */}
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: 1.35 }}>
                Tip: Double-click (desktop) or long-press (mobile) any annotation to move it anytime.
              </div>

              {/* Delete Selected Annotation */}
              {selectedAnnotationId && (
                <button
                  type="button"
                  className="btn-brutal"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    border: '1.5px solid #EF4444',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  onClick={onDeleteSelectedAnnotation}
                >
                  <Trash2 size={13} />
                  <span>Delete Selected Annotation</span>
                </button>
              )}
            </div>

            {/* 4. Backgrounds (5 Normal Presets in Demo, Full 16+8+20 in Studio) */}
            <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  4. Backgrounds
                </span>
                <span className="tag-mono" style={{ textTransform: 'capitalize' }}>
                  {GRADIENT_PRESETS[background]?.name || AURA_PRESETS_MAP[background]?.name || background}
                </span>
              </div>

              {isDemo ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'sunset', name: 'Sunset', bg: `linear-gradient(135deg, ${GRADIENT_PRESETS.sunset.colors.join(', ')})` },
                    { id: 'cyber', name: 'Cyber', bg: `linear-gradient(135deg, ${GRADIENT_PRESETS.cyber.colors.join(', ')})` },
                    { id: 'aurora', name: 'Aurora', bg: `linear-gradient(135deg, ${GRADIENT_PRESETS.aurora.colors.join(', ')})` },
                    { id: '#09090B', name: 'Obsidian', bg: '#09090B' },
                    { id: '#FFFFFF', name: 'Pure White', bg: '#FFFFFF' },
                  ].map((item) => {
                    const isSelected = background === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={item.name}
                        onClick={() => onBackgroundChange(item.id)}
                        style={{
                          height: '32px',
                          borderRadius: '6px',
                          border: isSelected ? '2.5px solid var(--accent-yellow)' : '1.5px solid var(--border-color)',
                          background: item.bg,
                          boxShadow: isSelected ? '2px 2px 0px var(--shadow-color)' : 'none',
                          transform: isSelected ? 'scale(1.05)' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <>
                  {/* 16 Curated Gradients */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>
                      16 CURATED GRADIENTS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {Object.entries(GRADIENT_PRESETS).map(([key, item]) => {
                        const bgCss = `linear-gradient(135deg, ${item.colors.join(', ')})`;
                        const isSelected = background === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            title={item.name}
                            onClick={() => onBackgroundChange(key)}
                            style={{
                              height: '32px',
                              borderRadius: '6px',
                              border: isSelected ? '2.5px solid var(--accent-yellow)' : '1.5px solid var(--border-color)',
                              background: bgCss,
                              boxShadow: isSelected ? '2px 2px 0px var(--shadow-color)' : 'none',
                              transform: isSelected ? 'scale(1.05)' : 'none',
                              cursor: 'pointer',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 8 Solids + Transparent */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>
                      8 SOLIDS &amp; TRANSPARENT
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {SOLID_PRESETS.map((solid) => {
                        const isSelected = background === solid.hex;
                        return (
                          <button
                            key={solid.hex}
                            type="button"
                            title={solid.name}
                            onClick={() => onBackgroundChange(solid.hex)}
                            style={{
                              height: '28px',
                              borderRadius: '6px',
                              border: isSelected ? '2.5px solid var(--accent-yellow)' : '1.5px solid var(--border-color)',
                              backgroundColor: solid.hex,
                              boxShadow: isSelected ? '2px 2px 0px var(--shadow-color)' : 'none',
                              transform: isSelected ? 'scale(1.05)' : 'none',
                              cursor: 'pointer',
                            }}
                          />
                        );
                      })}
                      {/* Transparent Button */}
                      <button
                        type="button"
                        title="Transparent Checkerboard"
                        onClick={() => onBackgroundChange('transparent')}
                        style={{
                          height: '28px',
                          borderRadius: '6px',
                          border: background === 'transparent' ? '2.5px solid var(--accent-yellow)' : '1.5px solid var(--border-color)',
                          backgroundImage:
                            'linear-gradient(45deg, #CBD5E1 25%, transparent 25%), linear-gradient(-45deg, #CBD5E1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #CBD5E1 75%), linear-gradient(-45deg, transparent 75%, #CBD5E1 75%)',
                          backgroundSize: '10px 10px',
                          backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                          boxShadow: background === 'transparent' ? '2px 2px 0px var(--shadow-color)' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>

                  {/* Show More Button -> Opens 20+ Neon, Modern Aura & AI Style Backgrounds Modal */}
                  <button
                    type="button"
                    className="btn-brutal"
                    onClick={() => setShowBgModal(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: AURA_PRESETS_MAP[background] ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      color: AURA_PRESETS_MAP[background] ? '#09090B' : 'var(--ink)',
                      border: '2px solid var(--border-color)',
                      boxShadow: '2px 2px 0px var(--shadow-color)',
                    }}
                    title={`Browse ${AURA_BACKGROUND_PRESETS.length} Neon, Aura Mesh & Galaxy Cosmic studio backgrounds`}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} />
                      <span>Show More ({AURA_BACKGROUND_PRESETS.length} Studio &amp; Cosmic)</span>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>

            {/* 5. Core & Pro Configurations (Underrated Studio Settings — Hidden in Demo) */}
            {!isDemo && (
            <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  5. Pro &amp; Niche Settings
                </span>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  UNDERRATED
                </span>
              </div>

              {/* 3D Tilt / Rotation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>3D Perspective Tilt</span>
                  <span className="tag-mono">{tilt}°</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {[-4, 0, 4].map((tVal) => (
                    <button
                      key={tVal}
                      type="button"
                      className="btn-brutal"
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        fontSize: '0.72rem',
                        backgroundColor: tilt === tVal ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                        color: tilt === tVal ? '#09090B' : 'var(--ink)',
                        boxShadow: tilt === tVal ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                        border: '1.5px solid var(--border-color)',
                      }}
                      onClick={() => onTiltChange(tVal)}
                    >
                      {tVal === 0 ? 'Flat (0°)' : `${tVal > 0 ? '+' : ''}${tVal}°`}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={tilt}
                  onChange={(e) => onTiltChange(Number(e.target.value))}
                  className="slider-brutal"
                />
              </div>

              {/* macOS Window Title */}
              {frameStyle === 'macos' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>macOS Window Title</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. terminal, app.tsx"
                    value={windowTitle}
                    onChange={(e) => onWindowTitleChange(e.target.value)}
                    className="input-brutal"
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  />
                </div>
              )}

              {/* Ambient Backlight Glow Toggle */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Ambient Aura Glow</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Diffused lighting behind card</div>
                  </div>
                  <button
                    type="button"
                    className="btn-brutal"
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      backgroundColor: ambientGlow ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      color: ambientGlow ? '#09090B' : 'var(--ink)',
                      boxShadow: ambientGlow ? '2px 2px 0px var(--shadow-color)' : 'none',
                      border: '1.5px solid var(--border-color)',
                    }}
                    onClick={() => onAmbientGlowChange(!ambientGlow)}
                  >
                    {ambientGlow ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>ON</span>
                        <Sparkles size={12} />
                      </span>
                    ) : (
                      'OFF'
                    )}
                  </button>
                </div>
              </div>

              {/* Outer Canvas Border */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Canvas Outer Border</span>
                  <span className="tag-mono">{canvasBorder}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'thin', label: 'Thin 2px' },
                    { id: 'bold', label: 'Bold 4px' },
                  ].map((borderOpt) => (
                    <button
                      key={borderOpt.id}
                      type="button"
                      className="btn-brutal"
                      style={{
                        padding: '4px 0',
                        fontSize: '0.72rem',
                        backgroundColor: canvasBorder === borderOpt.id ? 'var(--accent-blue)' : 'var(--card-bg-subtle)',
                        color: canvasBorder === borderOpt.id ? '#09090B' : 'var(--ink)',
                        boxShadow: canvasBorder === borderOpt.id ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                        border: '1.5px solid var(--border-color)',
                      }}
                      onClick={() => onCanvasBorderChange(borderOpt.id)}
                    >
                      {borderOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical Positioning */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Vertical Alignment</span>
                  <span className="tag-mono">{verticalAlign}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  {[
                    { id: 'center', label: 'Center' },
                    { id: 'top', label: 'Top-Heavy' },
                    { id: 'bottom', label: 'Bottom-Heavy' },
                  ].map((alignOpt) => (
                    <button
                      key={alignOpt.id}
                      type="button"
                      className="btn-brutal"
                      style={{
                        padding: '4px 0',
                        fontSize: '0.72rem',
                        backgroundColor: verticalAlign === alignOpt.id ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                        color: verticalAlign === alignOpt.id ? '#09090B' : 'var(--ink)',
                        boxShadow: verticalAlign === alignOpt.id ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                        border: '1.5px solid var(--border-color)',
                      }}
                      onClick={() => onVerticalAlignChange(alignOpt.id)}
                    >
                      {alignOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas Watermark / Personal Branding */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Watermark &amp; Branding</span>
                  <span className="tag-mono" style={{ fontSize: '0.66rem' }}>
                    {watermark === 'none' ? 'Hidden' : (watermark === 'made with makeapost.site' || watermark === 'made with makeapost.app') ? 'Default' : 'Custom'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: watermark !== 'none' && watermark !== 'made with makeapost.site' && watermark !== 'made with makeapost.app' ? '6px' : '0' }}>
                  <button
                    type="button"
                    className="btn-brutal"
                    style={{
                      padding: '4px 0',
                      fontSize: '0.72rem',
                      backgroundColor: (watermark === 'made with makeapost.site' || watermark === 'made with makeapost.app') ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      color: (watermark === 'made with makeapost.site' || watermark === 'made with makeapost.app') ? '#09090B' : 'var(--ink)',
                      boxShadow: (watermark === 'made with makeapost.site' || watermark === 'made with makeapost.app') ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                      border: '1.5px solid var(--border-color)',
                    }}
                    onClick={() => onWatermarkChange?.('made with makeapost.site')}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    className="btn-brutal"
                    style={{
                      padding: '4px 0',
                      fontSize: '0.72rem',
                      backgroundColor: (watermark && watermark !== 'made with makeapost.site' && watermark !== 'made with makeapost.app' && watermark !== 'none') ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      color: (watermark && watermark !== 'made with makeapost.site' && watermark !== 'made with makeapost.app' && watermark !== 'none') ? '#09090B' : 'var(--ink)',
                      boxShadow: (watermark && watermark !== 'made with makeapost.site' && watermark !== 'made with makeapost.app' && watermark !== 'none') ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                      border: '1.5px solid var(--border-color)',
                      opacity: planId === 'advanced' ? 1 : 0.72,
                    }}
                    onClick={() => {
                      if (planId !== 'advanced') {
                        onLockedFeatureClick?.('custom_watermark');
                        return;
                      }
                      if (!watermark || watermark === 'made with makeapost.site' || watermark === 'made with makeapost.app' || watermark === 'none') {
                        onWatermarkChange?.('@yourhandle');
                      }
                    }}
                  >
                    {planId === 'advanced' ? 'Custom' : 'Custom 🔒'}
                  </button>
                  <button
                    type="button"
                    className="btn-brutal"
                    style={{
                      padding: '4px 0',
                      fontSize: '0.72rem',
                      backgroundColor: watermark === 'none' ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      color: watermark === 'none' ? '#09090B' : 'var(--ink)',
                      boxShadow: watermark === 'none' ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                      border: '1.5px solid var(--border-color)',
                      opacity: planId === 'free' ? 0.72 : 1,
                    }}
                    onClick={() => {
                      if (planId === 'free') {
                        onLockedFeatureClick?.('hide_watermark');
                        return;
                      }
                      onWatermarkChange?.('none');
                    }}
                  >
                    {planId === 'free' ? 'None 🔒' : 'None'}
                  </button>
                </div>
                {watermark !== 'none' && watermark !== 'made with makeapost.site' && watermark !== 'made with makeapost.app' && planId === 'advanced' && (
                  <input
                    type="text"
                    placeholder="e.g. @yourname or yourbrand.dev"
                    value={watermark || ''}
                    onChange={(e) => onWatermarkChange?.(e.target.value.slice(0, 40))}
                    className="input-brutal"
                    style={{ fontSize: '0.78rem', padding: '5px 8px', width: '100%' }}
                    maxLength={40}
                  />
                )}
              </div>
            </div>
            )}
          </div>
        </div>

      {/* Responsive Neon, Aura & AI Creative Backgrounds Popup Modal */}
      {showBgModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bg-studio-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBgModal(false);
          }}
        >
          <div
            className="card-brutal"
            style={{
              maxWidth: '640px',
              width: '100%',
              maxHeight: '88vh',
              backgroundColor: 'var(--surface)',
              border: '3px solid var(--ink)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-card-hover, 6px 6px 0 var(--ink))',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Sticky Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '2px solid var(--border-color)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-yellow)',
                    border: '2px solid var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#09090B',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={17} />
                </div>
                <div>
                  <h3
                    id="bg-studio-modal-title"
                    style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--ink)' }}
                  >
                    Neon, Aura &amp; AI Backgrounds
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    20 studio-grade multi-layered mesh &amp; cyber presets
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBgModal(false)}
                style={{
                  background: 'none',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                }}
                title="Close background gallery"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '12px 20px',
                backgroundColor: 'var(--card-bg-subtle)',
                borderBottom: '2px solid var(--border-color)',
              }}
            >
              {['All', 'Neon Dark', 'AI Studio', 'Mesh Aura', 'Pastel & Light', 'Galaxy & Cosmic'].map((cat) => {
                const isActive = bgCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className="btn-brutal"
                    onClick={() => setBgCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'var(--accent-yellow)' : 'var(--surface)',
                      color: isActive ? '#09090B' : 'var(--ink)',
                      border: '1.5px solid var(--border-color)',
                      boxShadow: isActive ? '1.5px 1.5px 0 var(--shadow-color)' : 'none',
                    }}
                  >
                    {cat === 'All' ? `All (${AURA_BACKGROUND_PRESETS.length})` : cat}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Responsive Swatch Grid */}
            <div
              style={{
                padding: '16px 20px',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredAuraPresets.map((preset) => {
                const isSelected = background === preset.id;
                const cssStyle = getAuraCssStyle(preset);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onBackgroundChange(preset.id);
                      setShowBgModal(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'left',
                      padding: '6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: isSelected ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                      border: isSelected ? '2.5px solid var(--ink)' : '2px solid var(--border-color)',
                      boxShadow: isSelected ? '3px 3px 0px var(--shadow-color)' : '1.5px 1.5px 0px var(--shadow-color)',
                      cursor: 'pointer',
                      transition: 'transform 0.12s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '72px',
                        borderRadius: '4px',
                        border: '1.5px solid rgba(0, 0, 0, 0.25)',
                        position: 'relative',
                        overflow: 'hidden',
                        ...cssStyle,
                      }}
                    >
                      {/* Pattern overlay for grid / dots presets */}
                      {preset.pattern === 'grid' && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `linear-gradient(${preset.patternColor} 1px, transparent 1px), linear-gradient(90deg, ${preset.patternColor} 1px, transparent 1px)`,
                            backgroundSize: '12px 12px',
                          }}
                        />
                      )}
                      {preset.pattern === 'dots' && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `radial-gradient(${preset.patternColor} 1.2px, transparent 1.2px)`,
                            backgroundSize: '10px 10px',
                          }}
                        />
                      )}
                      {preset.pattern === 'beams' && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `linear-gradient(135deg, transparent 40%, ${preset.patternColor} 50%, transparent 60%)`,
                          }}
                        />
                      )}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-yellow)',
                            border: '2px solid #09090B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#09090B',
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '6px', padding: '0 2px', width: '100%' }}>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          color: isSelected ? '#09090B' : 'var(--ink)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {preset.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 600,
                          color: isSelected ? '#27272A' : 'var(--muted)',
                        }}
                      >
                        {preset.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderTop: '2px solid var(--border-color)',
                backgroundColor: 'var(--card-bg-subtle)',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                Infinite HD vector canvas rendering
              </span>
              <button
                type="button"
                className="btn-brutal"
                style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, backgroundColor: 'var(--surface)' }}
                onClick={() => setShowBgModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
