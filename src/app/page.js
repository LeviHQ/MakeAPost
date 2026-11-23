import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LandingNavbar from '@/components/LandingNavbar';
import { XIcon } from '@/components/SocialIcons';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Palette,
  Lock,
  Lightbulb,
  UploadCloud,
  Copy,
  Download,
  ShieldCheck,
} from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroTag} badge-brutal badge-yellow`}>
          <Sparkles size={13} />
          <span>30/70 SPLIT WORKSPACE: CANVAS + MULTIMODAL AI</span>
        </div>

        <h1 className={styles.headline}>
          INCREASE REACH OF YOUR{' '}
          <span className={styles.headlineHighlight}>SCREENSHOTS</span>
        </h1>

        <p className={styles.subheadline}>
          Turn raw screenshots into viral social posts in seconds. Edit your
          image &amp; generate tailored X, LinkedIn, and Reddit posts in one
          screen.
        </p>

        <div className={styles.heroCtaGroup}>
          <Link
            href="/editor"
            className={`btn-brutal btn-primary ${styles.heroBtn}`}
          >
            <span>Go to Editor</span>
            <ArrowRight size={16} />
          </Link>

          <div className={styles.microCopy}>
            <span>100% Free to Use</span>
            <span className={styles.dotSep}>•</span>
            <span>No card required</span>
            <span className={styles.dotSep}>•</span>
            <span>Free unlimited image editor &amp; AI posts</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive-Feel 30/70 Split Preview Showcase */}
      <section className={styles.previewSection}>
        <div className={styles.previewWindow}>
          {/* Mock Browser/App Header */}
          <div className={styles.windowBar}>
            <div className={styles.windowControls}>
              <span className={`${styles.dot} ${styles.dotRed}`} />
              <span className={`${styles.dot} ${styles.dotYellow}`} />
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <div className={styles.windowTitle}>
              make-a-post-studio-preview.app — [30% Dynamic Sidebar / 70% Visual Canvas]
            </div>
            <div className="badge-brutal badge-green" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
              <span>LIVE 30/70 SPLIT</span>
            </div>
          </div>

          {/* 30% Control Sidebar / 70% Main Canvas Split */}
          <div className={styles.previewGrid}>
            {/* Left 30% Sidebar: Dynamic Control Panel */}
            <div className={styles.sidebar30}>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>
                  30% Dynamic Sidebar
                </span>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  Sticky Pill
                </span>
              </div>

              {/* Sticky Mode Switcher Pill */}
              <div className={styles.modeSwitcherPill}>
                <div className={`${styles.modeTab} ${styles.modeTabActive}`}>
                  <Palette size={13} />
                  <span>Editor</span>
                </div>
                <div className={styles.modeTab}>
                  <Sparkles size={13} />
                  <span>AI Mode</span>
                </div>
              </div>

              {/* Active Mode Controls (Editor Mode Active State) */}
              <div className={styles.controlGroup}>
                <div className={styles.controlLabel}>
                  <span>Aspect Ratio</span>
                  <span className="tag-mono">16:9</span>
                </div>
                <div className={styles.aspectPills}>
                  <div className={`${styles.aspectBtn} ${styles.aspectBtnActive}`}>16:9</div>
                  <div className={styles.aspectBtn}>4:3</div>
                  <div className={styles.aspectBtn}>1:1</div>
                  <div className={styles.aspectBtn}>9:16</div>
                </div>

                <div className={styles.controlLabel}>
                  <span>Background Preset</span>
                  <span className="tag-mono">Sunset</span>
                </div>
                <div className={styles.gradientGrid}>
                  <span
                    className={`${styles.gradientSwatch} ${styles.gradientSwatchActive}`}
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #DB2777)' }}
                  />
                  <span
                    className={styles.gradientSwatch}
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
                  />
                  <span
                    className={styles.gradientSwatch}
                    style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}
                  />
                  <span
                    className={styles.gradientSwatch}
                    style={{ background: '#09090B' }}
                  />
                </div>

                <div className={styles.controlLabel}>
                  <span>Security &amp; Privacy</span>
                </div>
                <div className={styles.toggleBtn}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={13} />
                    <span>Blur Credentials</span>
                  </span>
                  <span style={{ fontWeight: 800 }}>ACTIVE</span>
                </div>
              </div>

              {/* Initial Selection Hint Strip */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--card-bg-subtle)',
                  border: '1.5px dashed var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)',
                  lineHeight: 1.4,
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                <Lightbulb size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-yellow)' }} />
                <div>
                  <strong>Fresh State:</strong> Shows 2 large selection cards (Image Editor vs AI Mode). Active state provides 1-click pill toggling anytime.
                </div>
              </div>
            </div>

            {/* Right 70% Canvas: Main Visual Dropzone & Live Render */}
            <div className={styles.canvas70}>
              <div className={styles.canvasHeader}>
                <span className={styles.canvasTitle}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>70% Main Visual Canvas &amp; Dropzone</span>
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="badge-brutal badge-blue" style={{ fontSize: '0.68rem' }}>
                    Ctrl+V Anywhere
                  </span>
                  <span className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem' }}>
                    Always Visible
                  </span>
                </div>
              </div>

              {/* Canvas Frame */}
              <div className={styles.mainCanvasStage}>
                <div className={styles.dropzoneOverlay}>
                  <span
                    className="badge-brutal"
                    style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <UploadCloud size={12} />
                    <span>Drop / Paste Screenshot [Ctrl+V]</span>
                  </span>
                </div>

                {/* Inner Mockup Card */}
                <div className={styles.canvasInnerCard}>
                  <div className={styles.innerCardHeader}>
                    <div className={styles.innerMiniDots}>
                      <span className={styles.miniDot} />
                      <span className={styles.miniDot} />
                      <span className={styles.miniDot} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                      make-a-post-studio.js
                    </span>
                  </div>

                  <div className={styles.mockCodeLine}>
                    <span className={styles.codeComment}>// 70% Canvas stays visible while AI generates copy</span>
                  </div>
                  <div className={styles.mockCodeLine}>
                    <span className={styles.codeKey}>const</span> post ={' '}
                    <span className={styles.codeKey}>await</span> studio.generatePosts({'{'}
                  </div>
                  <div className={styles.mockCodeLine} style={{ paddingLeft: '16px' }}>
                    layout: <span className={styles.codeString}>&apos;30-sidebar-70-canvas&apos;</span>,
                  </div>
                  <div className={styles.mockCodeLine} style={{ paddingLeft: '16px' }}>
                    apiSecret: <span className={styles.blurredArea}>sk_live_994821034</span>{' '}
                    <span style={{ fontSize: '0.65rem', color: '#FFD93D' }}>[Blurred Token]</span>
                  </div>
                  <div className={styles.mockCodeLine}>{'}'});</div>
                </div>

                {/* Integrated AI Post Result Snippet Floater */}
                <div className={styles.floatingAiSnippet}>
                  <div className={styles.aiSnippetHeader}>
                    <span style={{ color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <XIcon size={12} />
                      <span>X (Twitter) • Generated Thread Starter</span>
                    </span>
                    <span className="badge-brutal badge-yellow" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      <Zap size={11} />
                      <span>234 chars</span>
                    </span>
                  </div>
                  <div className={styles.aiSnippetBody}>
                    Stop uploading plain, unstyled screenshots. We split the studio into a 70% canvas and 30% dynamic control sidebar. Edit, blur, and generate viral copy in one screen! #buildinpublic #saas
                  </div>
                </div>
              </div>

              {/* Canvas Bottom Action Bar */}
              <div className={styles.canvasToolsBar}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>Canvas:</span>
                  <span className="tag-mono">1920 × 1080 (HD)</span>
                  <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem' }}>Ready</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-brutal"
                    style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                  >
                    <span>Copy Image</span>
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn-brutal btn-primary"
                    style={{ padding: '4px 14px', fontSize: '0.78rem' }}
                  >
                    <span>Export PNG</span>
                    <Download size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 3-Step How It Works Strip */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeadingGroup}>
          <div className={`${styles.sectionBadge} badge-brutal badge-yellow`}>
            SIMPLE WORKFLOW
          </div>
          <h2 className={styles.sectionTitle}>HOW IT WORKS</h2>
        </div>

        <div className={styles.stepsGrid}>
          {/* Card 1 */}
          <div className={styles.stepCard}>
            <div className={styles.stepBadge}>01</div>
            <h3 className={styles.stepTitle}>Paste on 70% Canvas (Ctrl+V)</h3>
            <p className={styles.stepDesc}>
              Copy any screenshot or UI snippet and paste it straight onto the
              canvas. Always visible with zero upload lag and no account required.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.stepCard}>
            <div className={styles.stepBadge}>02</div>
            <h3 className={styles.stepTitle}>Beautify &amp; Blur in 30% Sidebar</h3>
            <p className={styles.stepDesc}>
              Configure gradient backgrounds, aspect ratios, and blur sensitive
              tokens client-side with instant real-time canvas updates.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.stepCard}>
            <div className={styles.stepBadge}>03</div>
            <h3 className={styles.stepTitle}>Switch to AI Mode &amp; Post</h3>
            <p className={styles.stepDesc}>
              Toggle to AI Mode using the sticky pill. Multimodal Gemini AI reads
              your visual canvas and generates viral posts for X, LinkedIn, and
              Reddit.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Privacy Guarantee Strip */}
      <section className={styles.privacyBanner}>
        <div className={styles.privacyBox}>
          <div className={styles.privacyIcon}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className={styles.privacyTextTitle}>
              Zero History Stored • 100% Privacy-First Architecture
            </div>
            <div className={styles.privacyTextBody}>
              Your screenshots are never uploaded to any database or stored on
              our servers. All canvas editing happens purely on your device, and AI
              post generation is completely stateless.
            </div>
          </div>
        </div>
      </section>

      {/* 6. Global Multi-Column Neobrutalist Footer */}
      <Footer />
    </div>
  );
}
