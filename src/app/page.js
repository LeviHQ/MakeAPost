import Link from 'next/link';
import Logo from '@/components/Logo';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <Logo size={40} />

          <div className={styles.navRight}>
            <div className={`${styles.navBadge} badge-brutal badge-blue`}>
              ⚡ 100% Client-Side Canvas
            </div>
            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              Go to Editor →
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroTag} badge-brutal badge-yellow`}>
          ✨ DUAL-PANEL SCREENSHOT + AI SOCIAL ENGINE
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
            Go to Editor →
          </Link>

          <div className={styles.microCopy}>
            <span>3-day free trial</span>
            <span className={styles.dotSep}>•</span>
            <span>No card required</span>
            <span className={styles.dotSep}>•</span>
            <span>Free unlimited image editor</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive-Feel Static Preview Card (2-Panel Preview Showcase) */}
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
              make-a-post-studio-preview.app — [Dual-Panel Mode]
            </div>
            <div className="badge-brutal badge-green" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              ● LIVE PREVIEW
            </div>
          </div>

          {/* Dual Panel Split */}
          <div className={styles.previewGrid}>
            {/* Left Panel: Canvas Editor Preview */}
            <div className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  <span>🎨</span> 01. Canvas Beautifier
                </span>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem' }}>
                  100% Free &amp; Offline
                </span>
              </div>

              {/* Beautified Screenshot Frame */}
              <div className={styles.canvasFrame}>
                <div className={styles.canvasInnerCard}>
                  <div className={styles.innerCardHeader}>
                    <div className={styles.innerMiniDots}>
                      <span className={styles.miniDot} />
                      <span className={styles.miniDot} />
                      <span className={styles.miniDot} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                      api-route.js
                    </span>
                  </div>

                  <div className={styles.mockCodeLine}>
                    <span className={styles.codeComment}>// Multimodal single-shot generator</span>
                  </div>
                  <div className={styles.mockCodeLine}>
                    <span className={styles.codeKey}>const</span> post ={' '}
                    <span className={styles.codeKey}>await</span> ai.generate({'{'}
                  </div>
                  <div className={styles.mockCodeLine} style={{ paddingLeft: '16px' }}>
                    model: <span className={styles.codeString}>&apos;gemini-2.0-flash&apos;</span>,
                  </div>
                  <div className={styles.mockCodeLine} style={{ paddingLeft: '16px' }}>
                    apiSecret: <span className={styles.blurredArea}>sk_live_994821034</span>{' '}
                    <span style={{ fontSize: '0.65rem', color: '#FFD93D' }}>[Blurred]</span>
                  </div>
                  <div className={styles.mockCodeLine}>{'}'});</div>
                </div>
              </div>

              {/* Canvas Controls Bar */}
              <div className={styles.canvasToolsBar}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>Frame:</span>
                  <span className="badge-brutal" style={{ padding: '2px 8px' }}>16:9</span>
                  <span className="badge-brutal" style={{ padding: '2px 8px' }}>Round 16px</span>
                </div>
                <div className={styles.presetDots}>
                  <span className={styles.presetDot} style={{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }} />
                  <span className={styles.presetDot} style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }} />
                  <span className={styles.presetDot} style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)' }} />
                  <span className={styles.presetDot} style={{ background: '#09090B' }} />
                </div>
              </div>
            </div>

            {/* Right Panel: AI Social Studio Preview */}
            <div className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  <span>🤖</span> 02. AI Social Studio
                </span>
                <span className="badge-brutal badge-blue" style={{ fontSize: '0.68rem' }}>
                  Single-Shot Multi-Platform
                </span>
              </div>

              {/* Platform Switcher Tabs */}
              <div className={styles.platformTabs}>
                <button type="button" className={`${styles.tabBtn} ${styles.tabActive}`}>
                  𝕏 X (Twitter)
                </button>
                <button type="button" className={styles.tabBtn}>
                  💼 LinkedIn
                </button>
                <button type="button" className={styles.tabBtn}>
                  👾 Reddit
                </button>
              </div>

              {/* Post Preview Card */}
              <div className={styles.postCard}>
                <div className={styles.postAuthor}>
                  <div className={styles.authorAvatar}>MP</div>
                  <div className={styles.authorMeta}>
                    <span className={styles.authorName}>Adarsh J. Mishra</span>
                    <span className={styles.authorHandle}>@adarshjmishra • 2m</span>
                  </div>
                </div>

                <div className={styles.postContent}>
                  Stop posting raw unstyled screenshots 🛑
                  <br /><br />
                  We eliminated switching between Canva and ChatGPT with MakeAPost:
                  <br />
                  ✦ Edit &amp; blur credentials locally on HTML5 Canvas
                  <br />
                  ✦ Multimodal AI generates tailored X, LinkedIn &amp; Reddit posts
                  <br /><br />
                  Instant reach boost with zero backend image storage 👇
                </div>

                <div className={styles.postTags}>
                  <span className={styles.postTag}>#buildinpublic</span>
                  <span className={styles.postTag}>#indiehackers</span>
                  <span className={styles.postTag}>#saas</span>
                </div>

                <div className={styles.postActions}>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>
                    234 / 280 chars
                  </span>
                  <button
                    type="button"
                    className="btn-brutal btn-primary"
                    style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                  >
                    Copy Post 📋
                  </button>
                </div>
              </div>

              {/* Action Hint */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tag-mono">Format: Thread Starter (High Engagement)</span>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.7rem' }}>
                  ⚡ Generated in 1.2s
                </span>
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
            <h3 className={styles.stepTitle}>Paste Screenshot (Ctrl+V)</h3>
            <p className={styles.stepDesc}>
              Copy any screenshot or UI snippet and paste it straight onto the
              canvas. Works 100% offline in your browser with zero upload lag.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.stepCard}>
            <div className={styles.stepBadge}>02</div>
            <h3 className={styles.stepTitle}>Beautify &amp; Highlight</h3>
            <p className={styles.stepDesc}>
              Add vibrant gradients, sleek device frames, custom padding, and
              instantly blur sensitive credentials, API keys, or customer data.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.stepCard}>
            <div className={styles.stepBadge}>03</div>
            <h3 className={styles.stepTitle}>Generate Platform Posts</h3>
            <p className={styles.stepDesc}>
              Our multimodal Gemini AI reads your visual context in a single shot
              and writes high-converting, tailored posts for X, LinkedIn, and
              Reddit.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Privacy Guarantee Strip */}
      <section className={styles.privacyBanner}>
        <div className={styles.privacyBox}>
          <div className={styles.privacyIcon}>
            <span style={{ fontSize: '1.6rem' }}>🔒</span>
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

      {/* 6. Minimal Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Logo size={32} />

          <div className={styles.footerText}>
            MakeAPost • Zero History Stored • 100% Privacy-First
          </div>

          <Link
            href="/editor"
            className="btn-brutal btn-secondary"
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            Open Studio →
          </Link>
        </div>
      </footer>
    </div>
  );
}
