import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingLivePreview from '@/components/LandingLivePreview';
import LandingFaq from '@/components/LandingFaq';
import Footer from '@/components/Footer';
import { XIcon, LinkedInIcon } from '@/components/SocialIcons';
import {
  Sparkles,
  Rocket,
  ArrowDown,
  ArrowRight,
  Clock,
  Zap,
  Palette,
  Wand2,
  Share2,
  ShieldCheck,
  Layers,
  Gift,
  Check,
  X as XMark,
} from 'lucide-react';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: Palette,
    badge: 'IMAGE EDITOR',
    badgeClass: 'badge-yellow',
    title: 'Instant Canvas Framing',
    desc: 'Custom padding, rounded corners, Neobrutalist hard shadows, and curated background presets—applied in real time.',
  },
  {
    icon: Wand2,
    badge: 'MULTIMODAL AI',
    badgeClass: 'badge-blue',
    title: 'Context-Aware AI Copywriter',
    desc: 'Upload your screenshot + optional 1-line note; AI extracts the win or lesson and writes native hooks for X, LinkedIn, and Reddit simultaneously.',
  },
  {
    icon: Share2,
    badge: 'ZERO API RISK',
    badgeClass: 'badge-green',
    title: '1-Click Clipboard PNG + Native Intent',
    desc: 'Automatically copies high-res PNG to clipboard and opens X, LinkedIn, or Reddit composer pre-filled—zero API ban risk, full manual edit freedom.',
  },
  {
    icon: ShieldCheck,
    badge: 'PRIVACY FIRST',
    badgeClass: 'badge-yellow',
    title: '100% Zero Post History Stored',
    desc: 'Screenshots render in-browser and never touch a database—your client messages, emails, and drafts stay completely private.',
  },
  {
    icon: Layers,
    badge: 'VERSATILE',
    badgeClass: 'badge-blue',
    title: 'Built for Every Creator Moment',
    desc: 'Ship logs, GitHub and analytics milestones, client testimonials, study notes, and email wins—ready to share in seconds.',
  },
  {
    icon: Gift,
    badge: 'FREE TO START',
    badgeClass: 'badge-green',
    title: '3-Day Free Trial (No Credit Card)',
    desc: 'Jump straight into the studio and start creating with full canvas styling plus 5 free AI generations per day.',
  },
];

export default function LandingPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Sticky Neobrutalist Top Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroTag} badge-brutal badge-yellow`}>
          <Sparkles size={13} />
          <span>SCREENSHOT EDITOR + AI POST STUDIO IN ONE TAB</span>
        </div>

        <h1 className={styles.headline}>
          Stop Posting Raw Screenshots.{' '}
          <span className={styles.headlineHighlight}>
            Turn Wins Into Viral Posts
          </span>{' '}
          in 10 Seconds.
        </h1>

        <p className={styles.subheadline}>
          Paste any screenshot—a coding milestone, client message, email win, or
          product update—style it in a crisp Neobrutalist frame, generate
          platform-tuned copy for X, LinkedIn &amp; Reddit, and share in 1
          click. Zero tab-switching. Zero post history stored.
        </p>

        <div className={styles.heroCtaGroup}>
          <div className={styles.heroCtaButtons}>
            <Link
              href="/editor"
              className={`btn-brutal btn-primary ${styles.heroBtn}`}
            >
              <Rocket size={17} />
              <span>Try MakeAPost Free — No Card Needed</span>
            </Link>

            <a
              href="#before-after"
              className={`btn-brutal ${styles.heroSecondaryBtn}`}
            >
              <span>See Before &amp; After</span>
              <ArrowDown size={15} />
            </a>
          </div>

          <div className={styles.microCopy}>
            <span>Ctrl+V Paste Ready</span>
            <span className={styles.dotSep}>•</span>
            <span>No Card Required</span>
            <span className={styles.dotSep}>•</span>
            <span>X, LinkedIn &amp; Reddit</span>
          </div>
        </div>

        {/* Hero Visual Split Card (#before-after) */}
        <div id="before-after" className={styles.beforeAfterWrapper}>
          <div className={styles.beforeAfterGrid}>
            {/* Left: Before (Raw Cluttered Screenshot) */}
            <div className={styles.beforeCard}>
              <div className={styles.beforeAfterHeader}>
                <span className="badge-brutal" style={{ fontSize: '0.7rem', backgroundColor: 'var(--card-bg-subtle)' }}>
                  <XMark size={12} />
                  <span>BEFORE: RAW CLUTTERED SCREENSHOT</span>
                </span>
                <span className="tag-mono" style={{ fontSize: '0.7rem' }}>
                  Low engagement
                </span>
              </div>

              <div className={styles.rawMockBox}>
                <div className={styles.rawScreenshot}>
                  <div className={styles.rawTopStrip}>
                    <span>localhost:3000/dashboard - Chrome - Untitled</span>
                  </div>
                  <div className={styles.rawContent}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.7 }}>
                      Uncropped, dull screenshot with browser tabs &amp; bookmarks visible
                    </div>
                    <div className={styles.rawMetrics}>
                      <span>MRR: $1,420</span>
                      <span>Users: 312</span>
                      <span>API_KEY=sk_test_991a...</span>
                    </div>
                  </div>
                </div>

                <div className={styles.messyPostBox}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', opacity: 0.65 }}>
                    Blank composer... staring at cursor for 15 mins...
                  </span>
                  <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '4px' }}>
                    &ldquo;hey guys built this today check it out lol&rdquo;
                  </div>
                </div>
              </div>
            </div>

            {/* Right: After (MakeAPost Studio Output) */}
            <div className={styles.afterCard}>
              <div className={styles.beforeAfterHeader}>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.7rem' }}>
                  <Check size={12} />
                  <span>AFTER: MAKEAPOST STUDIO OUTPUT</span>
                </span>
                <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem' }}>
                  10 Seconds
                </span>
              </div>

              <div className={styles.polishedMockStage}>
                <div className={styles.polishedFrame}>
                  <div className={styles.polishedWindowBar}>
                    <div className={styles.innerMiniDots}>
                      <span className={styles.miniDot} style={{ backgroundColor: '#EF4444' }} />
                      <span className={styles.miniDot} style={{ backgroundColor: '#F59E0B' }} />
                      <span className={styles.miniDot} style={{ backgroundColor: '#10B981' }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                      growth-milestone.png
                    </span>
                  </div>
                  <div className={styles.polishedMetrics}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>MONTHLY RECURRING</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFD93D' }}>$1,420 MRR</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>ACTIVE CREATORS</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4ADE80' }}>312 Users</div>
                    </div>
                    <div className={styles.blurredTokenChip}>
                      <span>Blurred Secret</span>
                    </div>
                  </div>
                </div>

                <div className={styles.readyCopyBox}>
                  <div className={styles.readyCopyTop}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.74rem' }}>
                      <XIcon size={12} />
                      <LinkedInIcon size={12} />
                      <span>Ready-to-Paste Hook + Hashtags</span>
                    </span>
                    <span className="badge-brutal badge-blue" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                      PNG Copied
                    </span>
                  </div>
                  <p className={styles.readyCopyText}>
                    Crossed $1,420 MRR with 312 active creators—without spending $1 on ads. Focused on 1 pain point, shipped daily, and listened to every user reply. #buildinpublic #indiehackers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "Why MakeAPost?" — Old Workflow vs. MakeAPost Workflow (#problem) */}
      <section id="problem" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-blue">WHY MAKEAPOST?</div>
          <h2 className={styles.sectionTitle}>Ditch the 4-Tab Headache</h2>
          <p className={styles.sectionSubtitle}>
            Stop bouncing between design tools, AI chat tabs, and social composers just to share one update.
          </p>
        </div>

        <div className={styles.comparisonGrid}>
          {/* Old 4-Tab Headache */}
          <div className={styles.compareCardOld}>
            <div className={styles.compareCardHeader}>
              <div className="badge-brutal" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#09090B' }}>
                <Clock size={13} />
                <span>THE OLD 4-TAB HEADACHE</span>
              </div>
              <span className="tag-mono">~15 mins / post</span>
            </div>

            <ol className={styles.workflowList}>
              <li>Take raw screenshot on your desktop or phone.</li>
              <li>Open Canva or Figma to crop, add padding, and frame it.</li>
              <li>Download PNG and hunt for it in your Downloads folder.</li>
              <li>Open ChatGPT/Claude, explain context, and rewrite robotic drafts.</li>
              <li>Manually open X, LinkedIn, and Reddit and upload everything one by one.</li>
            </ol>
          </div>

          {/* MakeAPost 1-Tab Flow */}
          <div className={styles.compareCardNew}>
            <div className={styles.compareCardHeader}>
              <div className="badge-brutal badge-yellow">
                <Zap size={13} />
                <span>THE MAKEAPOST 1-TAB FLOW</span>
              </div>
              <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem' }}>
                ~10 seconds
              </span>
            </div>

            <ol className={styles.workflowList}>
              <li>
                <strong>Ctrl+V</strong> your screenshot directly onto the MakeAPost studio canvas.
              </li>
              <li>
                <strong>1-click frame &amp; polish</strong> with gradients, shadows, blur &amp; annotations.
              </li>
              <li>
                <strong>AI reads the screenshot</strong> and writes tailored X, LinkedIn &amp; Reddit posts.
              </li>
              <li>
                Click <strong>&ldquo;Post&rdquo;</strong> — auto-copies HD PNG to clipboard &amp; opens the native composer pre-filled.
              </li>
            </ol>

            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <Link href="/editor" className="btn-brutal btn-primary" style={{ width: '100%' }}>
                <span>Switch to the 1-Tab Flow</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. All-in-One Feature Grid (#features) */}
      <section id="features" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-yellow">ALL-IN-ONE STUDIO</div>
          <h2 className={styles.sectionTitle}>
            Image Editor + AI Copywriter + Zero-Risk Sharing
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything a builder, freelancer, or creator needs to ship visual updates consistently.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className={styles.featureCard}>
                <div className={styles.featureCardTop}>
                  <div className={styles.featureIconBox}>
                    <Icon size={20} />
                  </div>
                  <span className={`badge-brutal ${feat.badgeClass}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                    {feat.badge}
                  </span>
                </div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Interactive Live Output Preview (#preview) */}
      <section id="preview" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-green">LIVE OUTPUT PREVIEW</div>
          <h2 className={styles.sectionTitle}>See What One Screenshot Produces</h2>
          <p className={styles.sectionSubtitle}>
            Switch between real creator use cases and platform tabs to preview framed graphics alongside native copy.
          </p>
        </div>

        <LandingLivePreview />
      </section>

      {/* 6. Crisp FAQ Section (#faq) */}
      <section id="faq" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-yellow">FAQ</div>
          <h2 className={styles.sectionTitle}>Questions Answered</h2>
        </div>

        <LandingFaq />
      </section>

      {/* Final Conversion Strip */}
      <section className={styles.finalCtaSection}>
        <div className={styles.finalCtaBox}>
          <h2 className={styles.finalCtaTitle}>
            Ready to Turn Your Next Screenshot Into a Post?
          </h2>
          <p className={styles.finalCtaDesc}>
            No credit card. Zero post history stored. Open the studio and paste your first screenshot in seconds.
          </p>
          <Link
            href="/editor"
            className={`btn-brutal btn-primary ${styles.heroBtn}`}
          >
            <Rocket size={17} />
            <span>Launch Studio Free</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 7. Reusable Footer */}
      <Footer />
    </div>
  );
}
