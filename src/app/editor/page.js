'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Logo from '@/components/Logo';
import CanvasEditor from '@/components/CanvasEditor';
import ModeSidebar from '@/components/ModeSidebar';
import styles from './editor.module.css';

export default function EditorPage() {
  const canvasRef = useRef(null);

  // Mode Selection State ('fresh' | 'editor' | 'ai')
  const [activeMode, setActiveMode] = useState('editor');

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

    // Give one micro-tick for canvas to re-render without selection ring
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
    }, 20);
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
    }, 20);
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
      {/* 1. Slim Neobrutalist Header */}
      <header className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          <Logo size={32} />
          <div className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
            STUDIO WORKSPACE
          </div>
        </div>

        <div className={styles.headerRight}>
          {image && (
            <button
              type="button"
              className={`btn-brutal ${styles.headerBtn}`}
              onClick={handleReset}
              title="Clear canvas and import a new image"
            >
              New Image ↺
            </button>
          )}

          <button
            type="button"
            className={`btn-brutal ${styles.headerBtn}`}
            onClick={handleCopyPng}
            disabled={!image}
            style={{ opacity: image ? 1 : 0.6 }}
          >
            Copy PNG 📋
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
          >
            Download 2x PNG 📥
          </button>
        </div>
      </header>

      {/* 2. Main 30/70 Studio Split */}
      <div className={styles.workspaceLayout}>
        {/* Left 30% Width Dynamic Control Sidebar */}
        <ModeSidebar
          activeMode={activeMode}
          onModeChange={setActiveMode}
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

        {/* Right 70% Width Main Visual Canvas & Dropzone */}
        <CanvasEditor
          canvasRef={canvasRef}
          image={image}
          onImageLoaded={setImage}
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
