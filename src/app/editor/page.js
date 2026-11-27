'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import NavbarAuth, { GoogleIcon } from '@/components/NavbarAuth';
import CanvasEditor from '@/components/CanvasEditor';
import ModeSidebar from '@/components/ModeSidebar';
import UpgradeModal from '@/components/UpgradeModal';
import StudioExitModal from '@/components/StudioExitModal';
import { createClient } from '@/lib/supabase/client';
import { PLANS, DEFAULT_WATERMARK_TEXT, enforceWatermarkForPlan } from '@/lib/billing';
import { RotateCcw, Copy, Download, Image as ImageIcon, Sliders, Zap, ArrowRight, Menu, X, Home, Undo2, Redo2, ZoomIn, ZoomOut, Hand } from 'lucide-react';
import styles from './editor.module.css';

export default function EditorPage() {
  const router = useRouter();
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
  const [watermark, setWatermark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('makeapost-default-watermark') || 'made with makeapost.app';
    }
    return 'made with makeapost.app';
  });

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

  // Billing, Credits, Auth Gate & Exit Guard State
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [usage, setUsage] = useState({
    planId: 'free',
    planName: 'Free',
    imageCreditsUsed: 0,
    imageLimit: PLANS.free.dailyImages,
    aiCreditsUsed: { x: 0, linkedin: 0, reddit: 0 },
    aiLimitPerPlatform: PLANS.free.dailyAiPerPlatform,
  });
  const [hasExportedImage, setHasExportedImage] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState({ x: '', linkedin: '', reddit: '' });
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, title: '', desc: '', plansToShow: ['pro', 'advanced'] });
  const [exitModal, setExitModal] = useState({ open: false, targetHref: '/' });

  // Sync Watermark, Auth & Live Usage Credits from Server + Supabase Auth Listener
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let supabase = null;
    try {
      supabase = createClient();
    } catch {}

    async function loadBillingAndPreferences() {
      try {
        // 1. Verify direct Supabase client auth first so logged-in users are never blocked
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && isMounted) {
            setIsAuthenticated(true);
          }
        }

        // 2. Fetch full plan & credit usage from backend
        const res = await fetch('/api/credits/status');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data?.authenticated) {
            setIsAuthenticated(true);
            setUsage({
              planId: data.planId || 'free',
              planName: data.planName || 'Free',
              imageCreditsUsed: data.imageCreditsUsed || 0,
              imageLimit: data.imageLimit || PLANS.free.dailyImages,
              aiCreditsUsed: data.aiCreditsUsed || { x: 0, linkedin: 0, reddit: 0 },
              aiLimitPerPlatform: data.aiLimitPerPlatform || PLANS.free.dailyAiPerPlatform,
            });
            const safeMark = enforceWatermarkForPlan(
              data.defaultWatermark || DEFAULT_WATERMARK_TEXT,
              data.planId || 'free'
            );
            setWatermark(safeMark);
            try {
              localStorage.setItem('makeapost-default-watermark', safeMark);
            } catch {}
          } else {
            setIsAuthenticated(false);
          }
        } else if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (isMounted) setIsAuthenticated(Boolean(user));
        } else if (isMounted) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to load credits status:', err);
        if (isMounted) setIsAuthenticated(false);
      }
    }

    loadBillingAndPreferences();

    let subscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setIsAuthenticated(true);
          loadBillingAndPreferences();
        } else {
          setIsAuthenticated(false);
        }
      });
      subscription = data?.subscription || null;
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Warn user on browser tab close / hard refresh if edited image hasn't been exported
  useEffect(() => {
    if (!image || hasExportedImage) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [image, hasExportedImage]);

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
            setHasExportedImage(true);
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
        setHasExportedImage(true);
        showToast('Downloaded HD PNG successfully!');
      } catch (err) {
        console.error(err);
        showToast('Download failed.');
      }
    }, 25);
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/editor`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google sign in error:', err);
      setSigningIn(false);
      showToast('Could not start Google Sign-In. Please check popup/redirect settings.');
    }
  };

  const handleRequestExit = (targetHref) => {
    if (image && !hasExportedImage) {
      setExitModal({ open: true, targetHref });
      return;
    }
    router.push(targetHref);
  };

  const handleImageUploadWithCredit = async (img) => {
    if (!isAuthenticated) {
      setShowAuthGateModal(true);
      return;
    }
    try {
      const res = await fetch('/api/credits/image', { method: 'POST' });
      const data = await res.json();
      if (res.status === 401) {
        setIsAuthenticated(false);
        setShowAuthGateModal(true);
        return;
      }
      if (res.status === 429 && data.code === 'IMAGE_LIMIT_REACHED') {
        setUpgradeModal({
          open: true,
          title: `Daily Image Limit Reached (${data.used}/${data.limit})`,
          desc: `You have used all ${data.limit} image editing credits for today on your ${usage.planName} plan. Upgrade to unlock up to 50 daily edits!`,
        });
        return;
      }
      if (!res.ok || !data.success) {
        showToast(data.error || 'Could not verify image editing credit.');
        return;
      }
      setUsage((prev) => ({
        ...prev,
        imageCreditsUsed: data.imageCreditsUsed,
        imageLimit: data.imageLimit,
      }));
      setImage(img);
      setHasExportedImage(false);
      setGeneratedPosts({ x: '', linkedin: '', reddit: '' });
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      setIsPanMode(false);
      setMobileTab('canvas');
      showToast(`1 Image Credit used (${data.remaining} of ${data.imageLimit} left today)`);
    } catch (err) {
      console.error('Image credit check error:', err);
      showToast('Network error verifying image credit.');
    }
  };

  // Strict Google Sign-In Gate: Do not allow /editor access until authenticated
  if (isAuthenticated === null) {
    return (
      <div
        className={styles.editorContainer}
        style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      >
        <div className="badge-brutal badge-yellow" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
          <Zap size={16} />
          <span>Verifying Studio Access...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div
        className={styles.editorContainer}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundImage: 'radial-gradient(var(--dot-color) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div
          className="card-brutal"
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '28px 24px',
            backgroundColor: 'var(--surface)',
            color: 'var(--ink)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <Logo size={40} />
          <div className="badge-brutal badge-yellow" style={{ fontSize: '0.74rem' }}>
            <span>GOOGLE SIGN-IN REQUIRED</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 900, margin: 0 }}>
            Sign In to Open MakeAPost Studio
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: 0, lineHeight: 1.55 }}>
            Every account automatically starts on the <strong>Free Plan</strong> (<strong>3 image edits/day</strong> +{' '}
            <strong>1 AI post per platform/day</strong>, auto-renewed monthly)—no setup required.
          </p>
          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleSignIn}
            className="btn-brutal btn-primary"
            style={{ width: '100%', padding: '12px 18px', fontSize: '0.95rem' }}
          >
            <GoogleIcon size={18} />
            <span>{signingIn ? 'Redirecting to Google...' : 'Continue with Google'}</span>
            <ArrowRight size={15} />
          </button>
          <Link
            href="/"
            className="btn-brutal"
            style={{ width: '100%', padding: '9px 14px', fontSize: '0.85rem', backgroundColor: 'var(--surface)' }}
          >
            <Home size={14} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      {/* 1. Responsive Slim Top Header */}
      <header className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          <Logo size={30} />
          <div className={`${styles.headerStudioBadge} badge-brutal badge-yellow`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
            {usage.planName.toUpperCase()} • {Math.max(0, usage.imageLimit - usage.imageCreditsUsed)}/{usage.imageLimit} EDITS
          </div>
        </div>

        {/* Desktop Header Actions */}
        <div className={styles.desktopNav}>
          <button
            type="button"
            onClick={() => handleRequestExit('/')}
            className={`btn-brutal ${styles.headerBtn}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Back to Landing Page"
          >
            <Home size={14} />
            <span>Back to Home</span>
          </button>

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

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleRequestExit('/');
              }}
              className={`btn-brutal ${styles.mobileMenuItem}`}
            >
              <Home size={15} />
              <span>Back to Home</span>
            </button>
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
            watermark={watermark}
            onWatermarkChange={setWatermark}
            planId={usage.planId}
            onLockedFeatureClick={(featureKey) => {
              if (featureKey === 'custom_watermark') {
                setUpgradeModal({
                  open: true,
                  title: 'Custom Brand Handle Requires Advanced',
                  desc: 'Promote your personal handle (@you) or project domain on every exported image with the Advanced Plan ($15/mo).',
                  plansToShow: ['advanced'],
                });
              } else {
                setUpgradeModal({
                  open: true,
                  title: 'Hide Watermark Requires Pro or Advanced',
                  desc: 'Remove the MakeAPost badge for clean, unbranded exports by upgrading to Pro ($7/mo) or Advanced ($15/mo).',
                  plansToShow: ['pro', 'advanced'],
                });
              }
            }}
            aiProps={{
              usage,
              onPostsUpdated: setGeneratedPosts,
              onCreditsUpdated: (credits) => {
                setUsage((prev) => ({
                  ...prev,
                  aiCreditsUsed: credits.aiCreditsUsed || prev.aiCreditsUsed,
                  aiLimitPerPlatform: credits.aiLimitPerPlatform || prev.aiLimitPerPlatform,
                }));
              },
              onLimitReached: (limitData) => {
                setUpgradeModal({
                  open: true,
                  title: `Daily ${(limitData.platform || 'AI').toUpperCase()} Post Limit Reached (${limitData.used}/${limitData.limit})`,
                  desc: `You have used all ${limitData.limit} ${(limitData.platform || '').toUpperCase()} AI generations for today. Upgrade to unlock up to 15 posts per platform daily!`,
                });
              },
              onImageExported: () => setHasExportedImage(true),
            }}
          />
        </div>

        {/* Right 70% Visual Canvas Area */}
        <div className={`${styles.canvasPane} ${mobileTab === 'canvas' ? styles.paneVisible : ''}`}>
          <CanvasEditor
            canvasRef={canvasRef}
            image={image}
            onImageLoaded={handleImageUploadWithCredit}
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
            watermark={watermark}
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

      {/* Mandatory Google Sign-In Gate Modal */}
      {showAuthGateModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={() => setShowAuthGateModal(false)}
        >
          <div
            className="card-brutal"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              backgroundColor: 'var(--surface)',
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badge-brutal badge-yellow" style={{ alignSelf: 'center', fontSize: '0.74rem' }}>
              <span>GOOGLE SIGN-IN REQUIRED</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
              Sign In to Start Editing &amp; Posting
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              Sign in with Google to unlock <strong>3 free image edits/day</strong> and{' '}
              <strong>1 AI post per platform/day</strong> (X, LinkedIn &amp; Reddit). Zero screenshots or post history stored.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn-brutal btn-primary"
              style={{ width: '100%', padding: '11px 16px', fontSize: '0.92rem' }}
            >
              <GoogleIcon size={17} />
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAuthGateModal(false)}
              className="btn-brutal"
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', backgroundColor: 'var(--surface)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exit-Guard Warning Modal */}
      <StudioExitModal
        isOpen={exitModal.open}
        onClose={() => setExitModal({ open: false, targetHref: '/' })}
        onConfirmLeave={() => {
          const dest = exitModal.targetHref || '/';
          setExitModal({ open: false, targetHref: '/' });
          setHasExportedImage(true);
          router.push(dest);
        }}
        onDownloadPng={handleDownloadPng}
        onCopyPng={handleCopyPng}
        canvasRef={canvasRef}
        generatedPosts={generatedPosts}
        imageCreditsUsed={usage.imageCreditsUsed}
        imageLimit={usage.imageLimit}
        hasExported={hasExportedImage}
      />

      {/* Upgrade Plan Modal */}
      <UpgradeModal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, title: '', desc: '', plansToShow: ['pro', 'advanced'] })}
        reasonTitle={upgradeModal.title}
        reasonDesc={upgradeModal.desc}
        currentPlanId={usage.planId}
        plansToShow={upgradeModal.plansToShow}
      />
    </div>
  );
}
