'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import CanvasEditor from '@/components/CanvasEditor';
import ModeSidebar from '@/components/ModeSidebar';
import styles from './editor.module.css';

export default function EditorPage() {
  const canvasRef = useRef(null);

  // Mode Selection State ('fresh' | 'editor' | 'ai')
  const [activeMode, setActiveMode] = useState('editor');

  // Mobile View Switcher State ('canvas' | 'controls')
  const [mobileTab, setMobileTab] = useState('canvas');

  // Canvas Framing & Image State
  const [image, setImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [background, setBackground] = useState('cyber');
  const [padding, setPadding] = useState(48);
  const [borderRadius, setBorderRadius] = useState(16);
  const [shadow, setShadow] = useState(24);
  const [frameStyle, setFrameStyle] = useState('macos');

  // Core & Pro Configurations (Underrated Settings)
  const [windowTitle, setWindowTitle] = useState('preview.png');
  const [tilt, setTilt] = useState(0);
  const [ambientGlow, setAmbientGlow] = useState(false);
  const [canvasBorder, setCanvasBorder] = useState('none');
  const [verticalAlign, setVerticalAlign] = useState('center');

  // Annotation Tooling State
  const [activeTool, setActiveTool] = useState('select');
  const [annotationColor, setAnnotationColor] = useState('#EF4444');
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Keyboard Delete Annotation Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId) {
        // Prevent deleting if typing in input
        const targetTag = e.target?.tagName?.toLowerCase();
        if (targetTag === 'input' || targetTag === 'textarea') return;

        setAnnotations((prev) => prev.filter((ann) => ann.id !== selectedAnnotationId));
        setSelectedAnnotationId(null);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId]);

  // Canvas Action 1: Reset / New Image
  const handleReset = () => {
    setImage(null);
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setMobileTab('canvas');
    showToast('Canvas cleared for new image');
  };

  // Canvas Action 2: Copy High-Res 2x PNG to Clipboard
  const handleCopyPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      showToast('Load an image first to copy!');
      return;
    }

    // Deselect any active annotation so selection box is not copied
    setSelectedAnnotationId(null);

    setTimeout(() => {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            showToast('Copied 2x PNG to Clipboard! 📋');
          } catch {
            showToast('Clipboard write permission denied. Use Download instead.');
          }
        }, 'image/png');
      } catch (err) {
        console.error(err);
        showToast('Could not copy image.');
      }
    }, 25);
  };

  // Canvas Action 3: Download High-Res 2x PNG
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      showToast('Load an image first to download!');
      return;
    }

    // Deselect any active annotation so selection box is not downloaded
    setSelectedAnnotationId(null);

    setTimeout(() => {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `makeapost-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Downloaded 2x PNG successfully! 📥');
      } catch (err) {
        console.error(err);
        showToast('Download failed.');
      }
    }, 25);
  };

  // Delete Selected Annotation
  const handleDeleteSelectedAnnotation = () => {
    if (selectedAnnotationId) {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== selectedAnnotationId));
      setSelectedAnnotationId(null);
    }
  };

  const handleClearAnnotations = () => {
    setAnnotations([]);
    setSelectedAnnotationId(null);
    showToast('All annotations cleared');
  };

  return (
    <div className={styles.editorContainer}>
      {/* 1. Responsive Slim Top Header */}
      <header className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          <Logo size={30} />
          <div className={`${styles.headerStudioBadge} badge-brutal badge-yellow`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
            STUDIO
          </div>
        </div>

        <div className={styles.headerRight}>
          <ThemeToggle />

          {image && (
            <button
              type="button"
              className={`btn-brutal ${styles.headerBtn}`}
              onClick={handleReset}
              title="Clear canvas and import a new image"
            >
              <span className={styles.btnTextDesktop}>New Image ↺</span>
              <span className={styles.btnTextMobile}>↺</span>
            </button>
          )}

          <button
            type="button"
            className={`btn-brutal ${styles.headerBtn}`}
            onClick={handleCopyPng}
            disabled={!image}
            style={{ opacity: image ? 1 : 0.6 }}
            title="Copy 2x PNG to clipboard"
          >
            <span className={styles.btnTextDesktop}>Copy PNG 📋</span>
            <span className={styles.btnTextMobile}>📋</span>
          </button>

          <button
            type="button"
            className={`btn-brutal btn-primary ${styles.headerBtn}`}
            onClick={handleDownloadPng}
            disabled={!image}
            style={{
              opacity: image ? 1 : 0.6,
              fontWeight: 800,
            }}
            title="Download 2x PNG file"
          >
            <span className={styles.btnTextDesktop}>Download 2x PNG 📥</span>
            <span className={styles.btnTextMobile}>📥 2x</span>
          </button>
        </div>
      </header>

      {/* 2. Mobile View Switcher Tabs (Visible on screens < 900px) */}
      <div className={styles.mobileTabBar}>
        <button
          type="button"
          className={`${styles.mobileTabBtn} ${mobileTab === 'canvas' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('canvas')}
        >
          🖼️ Canvas Preview
        </button>
        <button
          type="button"
          className={`${styles.mobileTabBtn} ${mobileTab === 'controls' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('controls')}
        >
          ⚙️ Controls {annotations.length > 0 ? `(${annotations.length})` : ''}
        </button>
      </div>

      {/* 3. Main Studio Workspace Layout */}
      <div className={styles.workspaceLayout}>
        {/* Left 30% Control Sidebar */}
        <div className={`${styles.sidebarPane} ${mobileTab === 'controls' ? styles.paneVisible : ''}`}>
          <ModeSidebar
            activeMode={activeMode}
            onModeChange={setActiveMode}
            canvasRef={canvasRef}
            image={image}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            frameStyle={frameStyle}
            onFrameStyleChange={setFrameStyle}
            padding={padding}
            onPaddingChange={setPadding}
            borderRadius={borderRadius}
            onBorderRadiusChange={setBorderRadius}
            shadow={shadow}
            onShadowChange={setShadow}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            annotationColor={annotationColor}
            onAnnotationColorChange={setAnnotationColor}
            annotations={annotations}
            onClearAnnotations={handleClearAnnotations}
            selectedAnnotationId={selectedAnnotationId}
            onDeleteSelectedAnnotation={handleDeleteSelectedAnnotation}
            background={background}
            onBackgroundChange={setBackground}
            tilt={tilt}
            onTiltChange={setTilt}
            windowTitle={windowTitle}
            onWindowTitleChange={setWindowTitle}
            ambientGlow={ambientGlow}
            onAmbientGlowChange={setAmbientGlow}
            canvasBorder={canvasBorder}
            onCanvasBorderChange={setCanvasBorder}
            verticalAlign={verticalAlign}
            onVerticalAlignChange={setVerticalAlign}
          />
        </div>

        {/* Right 70% Visual Canvas Area */}
        <div className={`${styles.canvasPane} ${mobileTab === 'canvas' ? styles.paneVisible : ''}`}>
          <CanvasEditor
            canvasRef={canvasRef}
            image={image}
            onImageLoaded={(img) => {
              setImage(img);
              setMobileTab('canvas');
            }}
            aspectRatio={aspectRatio}
            background={background}
            padding={padding}
            borderRadius={borderRadius}
            shadow={shadow}
            frameStyle={frameStyle}
            windowTitle={windowTitle}
            tilt={tilt}
            ambientGlow={ambientGlow}
            canvasBorder={canvasBorder}
            verticalAlign={verticalAlign}
            activeTool={activeTool}
            annotationColor={annotationColor}
            annotations={annotations}
            onAnnotationsChange={setAnnotations}
            selectedAnnotationId={selectedAnnotationId}
            onSelectAnnotation={setSelectedAnnotationId}
          />

          {/* Floating Mobile Pill to Switch to Controls */}
          {image && mobileTab === 'canvas' && (
            <button
              type="button"
              className={`btn-brutal btn-primary ${styles.mobileFloatingPill}`}
              onClick={() => setMobileTab('controls')}
            >
              ⚙️ Customize Image &amp; Annotate →
            </button>
          )}
        </div>
      </div>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className={styles.toast}>
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
