'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import CanvasEditor from '@/components/CanvasEditor';
import ModeSidebar from '@/components/ModeSidebar';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import {
  ArrowRight,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Hand,
  Wand2,
  Loader2,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import styles from '@/app/page.module.css';

// Always pre-loaded MakeAPost Business Growth Demo Image (Zero local file upload)
const MAKEAPOST_GROWTH_RAW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="480" viewBox="0 0 840 480">
  <rect width="840" height="480" rx="12" fill="#FFFFFF"/>
  <rect x="0" y="0" width="840" height="54" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
  <circle cx="28" cy="27" r="7" fill="#FFD93D" stroke="#09090B" stroke-width="2"/>
  <text x="46" y="32" fill="#09090B" font-family="sans-serif" font-size="16" font-weight="800">MakeAPost Business Growth - Live Metrics</text>
  <rect x="650" y="14" width="164" height="26" rx="13" fill="#4ADE80" stroke="#09090B" stroke-width="1.5"/>
  <text x="668" y="31" fill="#09090B" font-family="monospace" font-size="11" font-weight="700">+142% MoM ORGANIC</text>

  <rect x="28" y="78" width="248" height="114" rx="10" fill="#F8FAFC" stroke="#09090B" stroke-width="2.5"/>
  <text x="46" y="108" fill="#475569" font-family="monospace" font-size="12" font-weight="700">MONTHLY RECURRING (MRR)</text>
  <text x="46" y="152" fill="#09090B" font-family="sans-serif" font-size="32" font-weight="900">$18,420</text>
  <text x="196" y="152" fill="#16A34A" font-family="monospace" font-size="14" font-weight="800">+48%</text>

  <rect x="296" y="78" width="248" height="114" rx="10" fill="#F8FAFC" stroke="#09090B" stroke-width="2.5"/>
  <text x="314" y="108" fill="#475569" font-family="monospace" font-size="12" font-weight="700">ACTIVE CREATORS</text>
  <text x="314" y="152" fill="#09090B" font-family="sans-serif" font-size="32" font-weight="900">2,840</text>
  <text x="444" y="152" fill="#2563EB" font-family="monospace" font-size="14" font-weight="800">+610/wk</text>

  <rect x="564" y="78" width="248" height="114" rx="10" fill="#FFD93D" stroke="#09090B" stroke-width="2.5"/>
  <text x="582" y="108" fill="#09090B" font-family="monospace" font-size="12" font-weight="700">POSTS GENERATED</text>
  <text x="582" y="152" fill="#09090B" font-family="sans-serif" font-size="32" font-weight="900">48,900</text>
  <text x="720" y="152" fill="#09090B" font-family="monospace" font-size="13" font-weight="800">0 STORED</text>

  <rect x="28" y="216" width="784" height="236" rx="10" fill="#09090B"/>
  <text x="52" y="250" fill="#94A3B8" font-family="monospace" font-size="13" font-weight="700">REVENUE AND CREATOR ADOPTION TRAJECTORY (LAST 6 MONTHS)</text>
  <rect x="64" y="368" width="72" height="54" rx="4" fill="#38BDF8"/>
  <rect x="184" y="344" width="72" height="78" rx="4" fill="#38BDF8"/>
  <rect x="304" y="320" width="72" height="102" rx="4" fill="#38BDF8"/>
  <rect x="424" y="294" width="72" height="128" rx="4" fill="#4ADE80"/>
  <rect x="544" y="270" width="72" height="152" rx="4" fill="#4ADE80"/>
  <rect x="664" y="242" width="72" height="180" rx="4" fill="#FFD93D"/>
  <text x="78" y="442" fill="#94A3B8" font-family="monospace" font-size="12">JUN</text>
  <text x="198" y="442" fill="#94A3B8" font-family="monospace" font-size="12">JUL</text>
  <text x="318" y="442" fill="#94A3B8" font-family="monospace" font-size="12">AUG</text>
  <text x="438" y="442" fill="#94A3B8" font-family="monospace" font-size="12">SEP</text>
  <text x="558" y="442" fill="#94A3B8" font-family="monospace" font-size="12">OCT</text>
  <text x="678" y="442" fill="#FFD93D" font-family="monospace" font-size="12" font-weight="800">NOV</text>
</svg>`;
const MAKEAPOST_GROWTH_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(MAKEAPOST_GROWTH_RAW_SVG)}`;

const DEMO_TONES = [
  { id: 'build', label: 'Build in Public' },
  { id: 'viral', label: 'Viral Hook' },
  { id: 'launch', label: 'Ship & Launch' },
  { id: 'story', label: 'Founder Story' },
];

// Fixed pre-written demo outputs (zero real API call)
const FIXED_DEMO_POSTS = {
  build: {
    x: `MakeAPost just crossed $18,420 MRR and 2,840 active creators—with $0 spent on ads.\n\nEvery post was created from 1 tab: paste screenshot, frame it, generate native copy, and share.\n\nConsistency beats complexity.\n\n#buildinpublic #indiehackers`,
    linkedin: `Small daily wins compound faster than big launches.\n\nThis month MakeAPost crossed:\n• $18,420 MRR (+48%)\n• 2,840 active creators\n• 48,900 posts generated with zero database storage\n\nTurns out builders don't need another complex dashboard—they just want to turn raw screenshots into clean posts in 10 seconds.\n\nWhat milestone are you chasing this month?`,
    reddit: `Title: Crossed $18,420 MRR & 2,840 creators with a zero-storage screenshot + AI post studio\n\nSharing our 6-month trajectory above. Instead of storing user images or asking for X/LinkedIn API tokens, we kept everything client-side + native web intents. Keeping it simple drove +142% MoM organic growth.`,
  },
  viral: {
    x: `Stop posting raw, uncropped screenshots.\n\nThis simple 1-tab workflow helped 2,840 creators generate 48,900+ posts and drove +142% MoM organic growth to $18,420 MRR.\n\nGood packaging turns quiet wins into distribution.`,
    linkedin: `Unpopular opinion: Most great product updates flop because the screenshot looks like an afterthought.\n\nWe fixed that bottleneck and watched MakeAPost grow +142% MoM to $18,420 MRR across 2,840 creators.\n\nFrame the win. Write a clear hook. Ship in 10 seconds.`,
    reddit: `Title: Why framing your screenshots properly doubled our organic social reach (+142% MoM growth)\n\nLooking at our 6-month growth chart, the inflection point happened when creators stopped posting raw browser dumps and started pairing clean frames with concise platform-native hooks.`,
  },
  launch: {
    x: `48,900 posts generated. 2,840 creators. $18,420 MRR.\n\nWe built MakeAPost so you never have to jump between Canva, ChatGPT, and 3 social tabs again.\n\nPaste screenshot -> Frame -> Post in 10s.`,
    linkedin: `Milestone update: MakeAPost is now powering 48,900+ social posts for 2,840 creators at $18,420 MRR.\n\nOur core thesis from day one:\n1. Zero screenshot storage\n2. Zero social media passwords\n3. One 30/70 workspace for visuals + copy\n\nThank you to every founder sharing their wins with us.`,
    reddit: `Title: [Milestone] Hit $18.4k MRR with MakeAPost — a 30/70 split studio for screenshot framing & AI post drafting\n\nHappy to answer any questions about our zero-storage HTML5 Canvas architecture, single-shot Gemini compression, or organic distribution strategy!`,
  },
  story: {
    x: `6 months ago I got tired of spending 15 minutes in Canva + ChatGPT just to share one coding screenshot.\n\nToday that tiny tool crossed $18,420 MRR and 2,840 active creators.\n\nScratch your own itch.`,
    linkedin: `6 months ago, sharing one product update took 4 open tabs and 15 minutes of busywork.\n\nSo I built a single-screen studio for myself—paste screenshot on the right, polish & generate copy on the left.\n\nToday, 2,840 creators use MakeAPost and we just passed $18,420 MRR organically.\n\nNever underestimate solving an annoying everyday workflow.`,
    reddit: `Title: Built a small tool to stop wasting 15 mins per screenshot post — 6 months later we hit $18,420 MRR\n\nStarted purely because I hated switching between Figma, ChatGPT, and X just to post a 2-sentence update. Kept the scope tiny and focused on speed and privacy.`,
  },
};

const PLATFORMS = [
  { id: 'x', label: 'X', Icon: XIcon },
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { id: 'reddit', label: 'Reddit', Icon: RedditIcon },
];

export default function LandingLivePreview() {
  const canvasRef = useRef(null);
  const [demoImage, setDemoImage] = useState(null);
  const [mobileTab, setMobileTab] = useState('controls'); // 'canvas' | 'controls'

  // Full Studio State (mirrors src/app/editor/page.js)
  const [activeMode, setActiveMode] = useState('editor');
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [background, setBackground] = useState('cyber');
  const [padding, setPadding] = useState(40);
  const [borderRadius, setBorderRadius] = useState(14);
  const [shadow, setShadow] = useState(24);
  const [frameStyle, setFrameStyle] = useState('macos');
  const [windowTitle, setWindowTitle] = useState('makeapost-growth.png');
  const [tilt, setTilt] = useState(0);
  const [ambientGlow, setAmbientGlow] = useState(false);
  const [canvasBorder, setCanvasBorder] = useState('none');
  const [verticalAlign, setVerticalAlign] = useState('center');
  const [watermark, setWatermark] = useState('made with makeapost.site');

  // Annotations + Undo/Redo + Pan/Zoom
  const [activeTool, setActiveTool] = useState('select');
  const [annotationColor, setAnnotationColor] = useState('#EF4444');
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);

  // Demo AI Mode States (Zero Real API Call, No Copy/Download Image buttons)
  const [activePlatform, setActivePlatform] = useState('x');
  const [activeTone, setActiveTone] = useState('build');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Always load the pre-loaded MakeAPost Business Growth image on mount
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setDemoImage({
        src: MAKEAPOST_GROWTH_SVG,
        width: img.naturalWidth || 840,
        height: img.naturalHeight || 480,
        element: img,
      });
    };
    img.src = MAKEAPOST_GROWTH_SVG;
  }, []);

  const handleAnnotationsChange = useCallback(
    (newAnnotations) => {
      setUndoStack((prev) => [...prev, annotations]);
      setRedoStack([]);
      setAnnotations(newAnnotations);
    },
    [annotations]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, annotations]);
    setAnnotations(previous);
    setSelectedAnnotationId(null);
  }, [undoStack, annotations]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations(next);
    setSelectedAnnotationId(null);
  }, [redoStack, annotations]);

  const handleDeleteSelectedAnnotation = useCallback(() => {
    if (!selectedAnnotationId) return;
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations((prev) => prev.filter((ann) => ann.id !== selectedAnnotationId));
    setSelectedAnnotationId(null);
  }, [selectedAnnotationId, annotations]);

  const handleResetDemo = () => {
    setAspectRatio('auto');
    setBackground('cyber');
    setPadding(40);
    setBorderRadius(14);
    setShadow(24);
    setFrameStyle('macos');
    setWindowTitle('makeapost-growth.png');
    setTilt(0);
    setAmbientGlow(false);
    setCanvasBorder('none');
    setVerticalAlign('center');
    setWatermark('made with makeapost.site');
    setAnnotations([]);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedAnnotationId(null);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsPanMode(false);
    setActiveTone('build');
    setActivePlatform('x');
    setHasGenerated(false);
  };

  const handleGenerateDemo = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 380);
  };

  const currentDemoCopy = FIXED_DEMO_POSTS[activeTone]?.[activePlatform] || FIXED_DEMO_POSTS.build.x;

  // Custom Demo AI Node rendered inside ModeSidebar when "2. AI Mode" is active (no API call, no copy/download buttons)
  const demoAiNode = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            Target Platform
          </span>
          <span className="badge-brutal badge-green" style={{ fontSize: '0.64rem', padding: '1px 7px' }}>
            DEMO • FIXED COPY
          </span>
        </div>

        <div className={styles.miniThreeGrid}>
          {PLATFORMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePlatform(id)}
              className={`btn-brutal ${styles.miniChipBtn} ${
                activePlatform === id ? styles.platformTabActive : ''
              }`}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '6px 4px' }}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '4px' }}>
          Creator Tone
        </div>
        <div className={styles.miniTwoGrid}>
          {DEMO_TONES.map((tone) => (
            <button
              key={tone.id}
              type="button"
              onClick={() => setActiveTone(tone.id)}
              className={`btn-brutal ${styles.miniChipBtn} ${
                activeTone === tone.id ? styles.miniChipActive : ''
              }`}
            >
              {tone.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGenerateDemo}
          disabled={isGenerating}
          className="btn-brutal btn-primary"
          style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem', marginTop: '4px' }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Generating Demo Post...</span>
            </>
          ) : (
            <>
              <Wand2 size={15} />
              <span>Generate Demo Post</span>
            </>
          )}
        </button>
      </div>

      {hasGenerated ? (
        <div className={styles.miniAiOutputBox}>
          <div className={styles.miniAiOutputHeader}>
            <span className="tag-mono" style={{ fontSize: '0.7rem' }}>
              {activePlatform.toUpperCase()} • {currentDemoCopy.length} chars
            </span>
            <span className="badge-brutal badge-blue" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
              READY TO POST
            </span>
          </div>
          <pre className={styles.miniAiOutputText}>{currentDemoCopy}</pre>
          <Link
            href="/editor"
            className="btn-brutal btn-primary"
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <span>Open Full Studio to Export &amp; Post</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div
          style={{
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px dashed var(--border-color)',
            backgroundColor: 'var(--card-bg-subtle)',
            fontSize: '0.78rem',
            color: 'var(--muted)',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          Select a platform and tone above, then click <strong>Generate Demo Post</strong> to preview fixed sample copy for this growth chart.
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.miniStudioWindow}>
      {/* Top Studio Bar (Undo/Redo + Reset + Open Full Studio — NO Copy/Download buttons) */}
      <div className={styles.miniStudioBar}>
        <div className={styles.miniStudioBarLeft}>
          <div className={styles.innerMiniDots}>
            <span className={styles.miniDot} style={{ backgroundColor: '#EF4444' }} />
            <span className={styles.miniDot} style={{ backgroundColor: '#F59E0B' }} />
            <span className={styles.miniDot} style={{ backgroundColor: '#10B981' }} />
          </div>
          <span className={styles.miniStudioTitle}>
            makeapost.site/editor — [Interactive Studio Demo]
          </span>
        </div>

        <div className={styles.miniStudioBarRight}>
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="btn-brutal"
            style={{ padding: '4px 8px', fontSize: '0.74rem', opacity: undoStack.length > 0 ? 1 : 0.45 }}
            title="Undo"
          >
            <Undo2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="btn-brutal"
            style={{ padding: '4px 8px', fontSize: '0.74rem', opacity: redoStack.length > 0 ? 1 : 0.45 }}
            title="Redo"
          >
            <Redo2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetDemo}
            className="btn-brutal"
            style={{ padding: '4px 10px', fontSize: '0.74rem', gap: '4px' }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <Link
            href="/editor"
            className="btn-brutal btn-primary"
            style={{ padding: '4px 12px', fontSize: '0.74rem', gap: '4px' }}
          >
            <span>Open Full Studio</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible < 900px) */}
      <div className={styles.demoMobileTabs}>
        <button
          type="button"
          onClick={() => setMobileTab('canvas')}
          className={`${styles.demoMobileTabBtn} ${mobileTab === 'canvas' ? styles.demoMobileTabActive : ''}`}
        >
          <ImageIcon size={14} />
          <span>70% Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('controls')}
          className={`${styles.demoMobileTabBtn} ${mobileTab === 'controls' ? styles.demoMobileTabActive : ''}`}
        >
          <Sliders size={14} />
          <span>30% Studio Controls</span>
        </button>
      </div>

      {/* Exact 30/70 Split Workspace */}
      <div className={styles.fullDemoGrid}>
        {/* Left 30% Full ModeSidebar */}
        <div className={`${styles.fullDemoSidebar} ${mobileTab === 'controls' ? styles.demoPaneShow : ''}`}>
          <ModeSidebar
            activeMode={activeMode}
            onModeChange={setActiveMode}
            canvasRef={canvasRef}
            image={demoImage}
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
            onClearAnnotations={() => {
              if (annotations.length > 0) {
                setUndoStack((prev) => [...prev, annotations]);
                setRedoStack([]);
                setAnnotations([]);
                setSelectedAnnotationId(null);
              }
            }}
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
            customAiNode={demoAiNode}
            isDemo={true}
          />
        </div>

        {/* Right 70% Full CanvasEditor (No free movement in demo) */}
        <div className={`${styles.fullDemoCanvasPane} ${mobileTab === 'canvas' ? styles.demoPaneShow : ''}`}>
          <CanvasEditor
            canvasRef={canvasRef}
            image={demoImage}
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
            canvasMaxHeight="520px"
            disableFreeMovement={true}
          />
        </div>
      </div>
    </div>
  );
}
