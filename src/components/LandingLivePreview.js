'use client';

import { useState } from 'react';
import Link from 'next/link';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import { Code2, MessageSquareQuote, BookOpen, ArrowRight, Sparkles, Check } from 'lucide-react';
import styles from '@/app/page.module.css';

const USE_CASES = [
  {
    id: 'code',
    label: 'Code / Build in Public',
    icon: Code2,
    frameBg: 'linear-gradient(135deg, #4F46E5 0%, #DB2777 100%)',
    windowTitle: 'imageCompress.ts — MakeAPost',
    mockupTitle: 'Shipped 78% Smaller Vision Payloads',
    mockupType: 'code',
    posts: {
      x: {
        badge: '214 chars • Viral Hook',
        copy: `Cut our AI vision payload by 78% today without losing OCR accuracy.\n\nInstead of sending raw 4K PNGs to the API, we resize client-side to 768px JPEG before upload.\n\nFaster responses. Lower API bills. Same crisp output.\n\n#buildinpublic #webdev`,
      },
      linkedin: {
        badge: 'Structured Story',
        copy: `Small engineering wins compound fast.\n\nToday we optimized our multimodal pipeline by compressing canvas exports client-side to 768px JPEG before hitting the server.\n\nResult:\n• 78% reduction in payload size\n• Sub-2s AI post generation\n• Zero quality drop on code & dashboard screenshots\n\nWhat's your favorite performance shortcut this week?`,
      },
      reddit: {
        badge: 'r/webdev • Value Post',
        copy: `Title: How we cut multimodal Vision API token costs by 78% with client-side canvas resizing\n\nWe noticed users pasting 4K retina screenshots straight into our studio. By downscaling only the AI analysis copy to 768px JPEG while keeping the user's downloadable PNG at 2x HD, latency dropped dramatically and token usage stayed predictable.`,
      },
    },
  },
  {
    id: 'client',
    label: 'Client Win',
    icon: MessageSquareQuote,
    frameBg: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    windowTitle: 'client-feedback.png',
    mockupTitle: 'Client Testimonial Milestone',
    mockupType: 'client',
    posts: {
      x: {
        badge: '188 chars • Social Proof',
        copy: `Nothing beats waking up to a client message like this.\n\n3 weeks of tight sprints, zero scope creep, and an onboarding flow that cut their setup time in half.\n\nShow up, ship clean work, communicate clearly.`,
      },
      linkedin: {
        badge: 'Case Study Format',
        copy: `Client feedback is the only metric that truly matters.\n\nWhen we started redesigning this B2B onboarding flow, the goal was simple: get new teams to their first win in under 5 minutes.\n\nSeeing their team celebrate the launch on our wrap-up call made every late-night iteration worth it.\n\nGrateful to build alongside founders who care deeply about craft.`,
      },
      reddit: {
        badge: 'r/freelance • Lesson Learned',
        copy: `Title: Replacing a 12-step onboarding form with a 3-minute guided setup doubled our client's activation rate\n\nSharing a quick win from this week's sprint. Instead of dumping users into an empty dashboard, we pre-populated sample data and let them test immediately. Client reaction in the screenshot above.`,
      },
    },
  },
  {
    id: 'learning',
    label: 'Learning Note',
    icon: BookOpen,
    frameBg: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
    windowTitle: 'dev-notes.md',
    mockupTitle: 'Zero-Upload Clipboard PNG Trick',
    mockupType: 'learning',
    posts: {
      x: {
        badge: '196 chars • Dev Tip',
        copy: `TIL: You can copy a high-res HTML5 Canvas PNG straight to the user's clipboard in 4 lines of JS—zero backend upload needed.\n\ncanvas.toBlob() + navigator.clipboard.write() = instant Ctrl+V anywhere.\n\nBrowser APIs are wild.`,
      },
      linkedin: {
        badge: 'Educational Breakdown',
        copy: `One of my favorite browser APIs this year: ClipboardItem + canvas.toBlob().\n\nMost tools upload your image to an S3 bucket just to let you share it. By rendering on HTML5 Canvas and writing the PNG blob straight to the clipboard, users get:\n\n1. Instant speed\n2. Zero server storage\n3. Complete privacy for sensitive screenshots\n\nSimple, local-first web engineering wins.`,
      },
      reddit: {
        badge: 'r/javascript • TIL',
        copy: `Title: TIL you can pass a canvas.toBlob() Promise directly into ClipboardItem for instant image copy in modern browsers\n\nTip for anyone building canvas tools: keep the ClipboardItem creation inside the synchronous click handler and pass the blob Promise directly so Safari and Chrome don't block the clipboard gesture.`,
      },
    },
  },
];

const PLATFORMS = [
  { id: 'x', label: 'X', Icon: XIcon },
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { id: 'reddit', label: 'Reddit', Icon: RedditIcon },
];

export default function LandingLivePreview() {
  const [activeCaseId, setActiveCaseId] = useState('code');
  const [activePlatform, setActivePlatform] = useState('x');

  const currentCase = USE_CASES.find((c) => c.id === activeCaseId) || USE_CASES[0];
  const currentPost = currentCase.posts[activePlatform] || currentCase.posts.x;

  return (
    <div className={styles.livePreviewCard}>
      {/* Top Switcher Bar: Use Cases + Platform Tabs */}
      <div className={styles.livePreviewToolbar}>
        <div className={styles.useCaseTabs} role="tablist" aria-label="Select creator use case">
          {USE_CASES.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeCaseId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCaseId(item.id)}
                className={`btn-brutal ${styles.previewTabBtn} ${isActive ? styles.previewTabActive : ''}`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.platformTabs} role="tablist" aria-label="Select target social platform">
          {PLATFORMS.map(({ id, label, Icon }) => {
            const isActive = id === activePlatform;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActivePlatform(id)}
                className={`btn-brutal ${styles.platformTabBtn} ${isActive ? styles.platformTabActive : ''}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Output: Framed Canvas Mockup (Left) + AI Generated Copy (Right) */}
      <div className={styles.livePreviewGrid}>
        {/* Left: Framed Screenshot Mockup */}
        <div className={styles.liveCanvasStage} style={{ background: currentCase.frameBg }}>
          <div className={styles.liveMacWindow}>
            <div className={styles.liveMacBar}>
              <div className={styles.innerMiniDots}>
                <span className={styles.miniDot} style={{ backgroundColor: '#EF4444' }} />
                <span className={styles.miniDot} style={{ backgroundColor: '#F59E0B' }} />
                <span className={styles.miniDot} style={{ backgroundColor: '#10B981' }} />
              </div>
              <span className={styles.liveMacTitle}>{currentCase.windowTitle}</span>
            </div>

            <div className={styles.liveMacBody}>
              {currentCase.mockupType === 'code' && (
                <div className={styles.liveCodeMock}>
                  <div className={styles.codeComment}>// Client-side vision optimization</div>
                  <div>
                    <span className={styles.codeKey}>const</span> payload ={' '}
                    <span className={styles.codeKey}>await</span> compressCanvas(canvas, {'{'}
                  </div>
                  <div style={{ paddingLeft: '14px' }}>
                    maxWidth: <span className={styles.codeString}>768</span>, quality:{' '}
                    <span className={styles.codeString}>0.65</span>
                  </div>
                  <div>{'}'});</div>
                  <div className={styles.liveDiffBadge}>
                    <Check size={12} />
                    <span>-78% tokens • 100% client-side</span>
                  </div>
                </div>
              )}

              {currentCase.mockupType === 'client' && (
                <div className={styles.liveClientMock}>
                  <div className={styles.liveClientHeader}>
                    <div className={styles.liveClientAvatar}>MK</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>Maya Kapoor • Founder</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Verified Client Message</div>
                    </div>
                  </div>
                  <p className={styles.liveClientQuote}>
                    &ldquo;Just walked our ops team through the new onboarding flow—everyone literally cheered on the call. Setup time dropped from 25 mins to under 4!&rdquo;
                  </p>
                </div>
              )}

              {currentCase.mockupType === 'learning' && (
                <div className={styles.liveNoteMock}>
                  <div className="badge-brutal badge-yellow" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                    DEV NOTE • BROWSER API
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', marginTop: '8px' }}>
                    Zero-Server Clipboard PNG Copy
                  </div>
                  <p style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '6px', lineHeight: 1.45 }}>
                    Pass <code>canvas.toBlob()</code> directly into <code>ClipboardItem</code> inside the click handler for instant Ctrl+V sharing.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.liveWatermarkPill}>made with makeapost.app</div>
        </div>

        {/* Right: Platform-Tuned AI Copy Output */}
        <div className={styles.liveCopyPane}>
          <div className={styles.liveCopyHeader}>
            <div className="badge-brutal badge-blue" style={{ fontSize: '0.7rem' }}>
              <Sparkles size={12} />
              <span>AI GENERATED FOR {activePlatform.toUpperCase()}</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              {currentPost.badge}
            </span>
          </div>

          <pre className={styles.liveCopyText}>{currentPost.copy}</pre>

          <div className={styles.liveCopyFooter}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              1-click &ldquo;Post&rdquo; copies PNG + opens composer
            </span>
            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              <span>Try This in Studio</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
