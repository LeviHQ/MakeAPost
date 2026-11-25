'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import NavbarAuth from '@/components/NavbarAuth';
import CanvasEditor from '@/components/CanvasEditor';
import ModeSidebar from '@/components/ModeSidebar';
import { RotateCcw, Copy, Download, Image as ImageIcon, Sliders, Zap, ArrowRight, Menu, X, Home, Undo2, Redo2, ZoomIn, ZoomOut, Hand } from 'lucide-react';
import styles from './editor.module.css';

export default function EditorPage() {
  const canvasRef = useRef(null);

  // Mode Selection State ('fresh' | 'editor' | 'ai')
  const [activeMode, setActiveMode] = useState('editor');

  // Mobile View Switcher State ('canvas' | 'controls')
  const [mobileTab, setMobileTab] = useState('canvas');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Canvas Framing & Image State
  const [image, setImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
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

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Record Undo State on New Annotation / Edit
  const handleAnnotationsChange = useCallback((newAnnotations) => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations(newAnnotations);
  }, [annotations]);

  // Undo (Back)
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, annotations]);
    setAnnotations(previous);
    setSelectedAnnotationId(null);
    showToast('Undo: Step Back');
  }, [undoStack, annotations, showToast]);

  // Redo (Next)
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations(next);
    setSelectedAnnotationId(null);
    showToast('Redo: Step Forward');
  }, [redoStack, annotations, showToast]);

  // Delete Selected Annotation
  const handleDeleteSelectedAnnotation = useCallback(() => {
    if (selectedAnnotationId) {
      setUndoStack((prev) => [...prev, annotations]);
      setRedoStack([]);
      setAnnotations((prev) => prev.filter((ann) => ann.id !== selectedAnnotationId));
      setSelectedAnnotationId(null);
      showToast('Annotation deleted');
    }
  }, [selectedAnnotationId, annotations, showToast]);

  // Clear All Annotations
  const handleClearAnnotations = useCallback(() => {
    if (annotations.length > 0) {
      setUndoStack((prev) => [...prev, annotations]);
      setRedoStack([]);
      setAnnotations([]);
      setSelectedAnnotationId(null);
      showToast('All annotations cleared');
    }
  }, [annotations, showToast]);

  // Canvas Action 1: Reset / New Image
  const handleReset = useCallback(() => {
    setImage(null);
    setAnnotations([]);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedAnnotationId(null);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsPanMode(false);
    setMobileTab('canvas');
    showToast('Canvas reset. Load a new image!');
  }, [showToast]);

  // Keyboard Shortcuts (Delete, Backspace, Ctrl+Z Undo, Ctrl+Y Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId) {
        handleDeleteSelectedAnnotation();
        e.preventDefault();
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (cmdOrCtrl && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, handleDeleteSelectedAnnotation, handleUndo, handleRedo]);

  // Canvas Action 2: Copy High-Res HD PNG to Clipboard
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
            showToast('Copied HD PNG to Clipboard!');
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

  // Canvas Action 3: Download High-Res HD PNG
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
        a.remove();
        showToast('Downloaded HD PNG successfully!');
      } catch (err) {
        console.error(err);
        showToast('Download failed.');
      }
    }, 25);
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

        {/* Desktop Header Actions */}
        <div className={styles.desktopNav}>
          <Link
            href="/"
            className={`btn-brutal ${styles.headerBtn}`}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Back to Landing Page"
          >
            <Home size={14} />
            <span>Back to Home</span>
          </Link>

          <NavbarAuth />

          {image && (
            <button
              type="button"
              className={`btn-brutal ${styles.headerBtn}`}
              onClick={handleReset}
              title="Clear canvas and import a new image"
            >
              <RotateCcw size={14} />
              <span>New Image</span>
            </button>
          )}

          <button
            type="button"
            className={`btn-brutal ${styles.headerBtn}`}
            onClick={handleCopyPng}
            disabled={!image}
            style={{ opacity: image ? 1 : 0.6 }}
            title="Copy HD PNG to clipboard"
          >
            <Copy size={14} />
            <span>Copy PNG</span>
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
            title="Download HD PNG file"
          >
            <Download size={14} />
            <span>Download HD PNG</span>
          </button>
        </div>

        {/* Mobile Action & Hamburger Row */}
        <div className={styles.mobileNav}>
          <button
            type="button"
            className={`btn-brutal btn-primary ${styles.headerBtn}`}
            onClick={handleDownloadPng}
            disabled={!image}
            style={{
              opacity: image ? 1 : 0.6,
              fontWeight: 800,
              padding: '6px 10px',
              fontSize: '0.8rem',
            }}
            title="Download HD PNG"
          >
            <Download size={13} />
            <span>HD PNG</span>
          </button>

          <button
            type="button"
            className={`btn-brutal ${styles.hamburgerBtn}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle studio menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileDropdown}>
            <NavbarAuth fullWidth onNavigate={() => setMobileMenuOpen(false)} />

            {image && (
              <button
                type="button"
                className={`btn-brutal ${styles.mobileMenuItem}`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleReset();
                }}
              >
                <RotateCcw size={15} />
                <span>New Image (Reset)</span>
              </button>
            )}

            <button
              type="button"
              className={`btn-brutal ${styles.mobileMenuItem}`}
              onClick={() => {
                setMobileMenuOpen(false);
                handleCopyPng();
              }}
              disabled={!image}
              style={{ opacity: image ? 1 : 0.6 }}
            >
              <Copy size={15} />
              <span>Copy HD PNG</span>
            </button>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`btn-brutal ${styles.mobileMenuItem}`}
              style={{ textDecoration: 'none' }}
            >
              <Home size={15} />
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </header>

      {/* 2. Mobile View Switcher Tabs (Visible on screens < 900px) */}
      <div className={styles.mobileTabBar}>
        <button
          type="button"
          className={`${styles.mobileTabBtn} ${mobileTab === 'canvas' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('canvas')}
        >
          <ImageIcon size={14} />
          <span>Canvas</span>
        </button>
        <button
          type="button"
          className={`${styles.mobileTabBtn} ${mobileTab === 'controls' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('controls')}
        >
          <Sliders size={14} />
          <span>Controls {annotations.length > 0 ? `(${annotations.length})` : ''}</span>
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
            onToolChange={(tool) => {
              setActiveTool(tool);
              setIsPanMode(false);
            }}
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
              setZoomScale(1);
              setPanOffset({ x: 0, y: 0 });
              setIsPanMode(false);
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
            onAnnotationsChange={handleAnnotationsChange}
            selectedAnnotationId={selectedAnnotationId}
            onSelectAnnotation={setSelectedAnnotationId}
            zoomScale={zoomScale}
            onZoomChange={setZoomScale}
            panOffset={panOffset}
            onPanChange={setPanOffset}
            isPanMode={isPanMode}
          />

          {/* Floating Zoom & Pan Toolbar (Bottom-Left Corner of 70% Canvas) */}
          {image ? (
            <div className={styles.canvasZoomBar}>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setIsPanMode((p) => !p)}
                style={{
                  backgroundColor: isPanMode ? 'var(--accent-yellow)' : undefined,
                  color: isPanMode ? '#09090B' : undefined,
                }}
                title="Hand / Move Canvas (Space + Drag / 2-Finger Drag)"
                aria-label="Toggle canvas move mode"
              >
                <Hand size={14} />
              </button>
              <div className={styles.zoomDivider} />
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setZoomScale((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
                disabled={zoomScale <= 0.4}
                title="Zoom Out (Pinch in / Ctrl + Scroll Down)"
                aria-label="Zoom out"
              >
                <ZoomOut size={14} />
              </button>
              <div className={styles.zoomDivider} />
              <button
                type="button"
                className={styles.zoomPercentBadge}
                onClick={() => {
                  setZoomScale(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                title="Click to Reset Zoom & Position (100%)"
                aria-label="Reset zoom and position to 100%"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <div className={styles.zoomDivider} />
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setZoomScale((z) => Math.min(3.0, Number((z + 0.15).toFixed(2))))}
                disabled={zoomScale >= 3.0}
                title="Zoom In (Pinch out / Ctrl + Scroll Up)"
                aria-label="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          ) : null}

          {/* Floating Undo (Back) & Redo (Next) Toolbar (Right-Bottom Corner of 70% Canvas) */}
          {image ? (
            <div className={styles.canvasHistoryBar}>
              <button
                type="button"
                className={`btn-brutal ${styles.historyBtn}`}
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Back / Undo (Ctrl+Z)"
                aria-label="Undo action"
              >
                <Undo2 size={15} />
                <span className={styles.historyBtnText}>Back</span>
              </button>
              <div className={styles.historyDivider} />
              <button
                type="button"
                className={`btn-brutal ${styles.historyBtn}`}
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Next / Redo (Ctrl+Y)"
                aria-label="Redo action"
              >
                <span className={styles.historyBtnText}>Next</span>
                <Redo2 size={15} />
              </button>
            </div>
          ) : null}

          {/* Floating Mobile Pill to Switch to Controls */}
          {image && mobileTab === 'canvas' ? (
            <button
              type="button"
              className={`btn-brutal btn-primary ${styles.mobileFloatingPill}`}
              onClick={() => setMobileTab('controls')}
            >
              <Sliders size={14} />
              <span>Customize Image &amp; Annotate</span>
              <ArrowRight size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Floating Action Toast */}
      {toastMessage ? (
        <div className={styles.toast}>
          <Zap size={15} style={{ color: 'var(--accent-yellow)', flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
