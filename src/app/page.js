import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingLivePreview from '@/components/LandingLivePreview';
import LandingPricingSection from '@/components/LandingPricingSection';
import LandingHeroCta from '@/components/LandingHeroCta';
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
  KeyRound,
  Cpu,
  EyeOff,
  Database,
  Check,
  X as XMark,
} from 'lucide-react';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: Palette,
    badge: 'BROWSER-NATIVE',
    badgeClass: 'badge-yellow',
    title: 'Browser-Native Screenshot Editor',
    desc: 'Custom padding, rounded corners, Neobrutalist hard shadows, background presets, and optional brand watermark toggle.',
  },
  {
    icon: Wand2,
    badge: 'MULTIMODAL AI',
    badgeClass: 'badge-blue',
    title: 'Context-Aware AI Copywriter',
    desc: 'Reads your screenshot + optional 1-line note to craft native hooks for X, LinkedIn, and Reddit simultaneously.',
  },
  {
    icon: Share2,
    badge: 'ZERO API RISK',
    badgeClass: 'badge-green',
    title: '1-Click Clipboard PNG + Native Intent',
    desc: 'Automatically copies crisp PNG to clipboard and opens X, LinkedIn, or Reddit composer pre-filled—zero third-party API token risk.',
  },
  {
    icon: Cpu,
    badge: 'IN-MEMORY ONLY',
    badgeClass: 'badge-yellow',
    title: 'Ephemeral In-Memory Processing',
    desc: 'Screenshots render locally in your browser and are sent transiently for AI generation—never written to any database or bucket.',
  },
  {
    icon: KeyRound,
    badge: 'ZERO CREDENTIALS',
    badgeClass: 'badge-blue',
    title: 'Zero Social Account Passwords',
    desc: 'Sign in securely via Google OAuth (Supabase Auth); we never ask for your X, LinkedIn, or Reddit credentials.',
  },
  {
    icon: Rocket,
    badge: 'INSTANT START',
    badgeClass: 'badge-green',
    title: 'Instant Access',
    desc: 'Jump straight into /editor and start turning raw captures into publish-ready posts in seconds.',
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
          <span>SCREENSHOT STUDIO + AI POST WRITER IN ONE TAB</span>
        </div>

        <h1 className={styles.headline}>
          Stop Posting Raw Screenshots.{' '}
          <span className={styles.headlineHighlight}>
            Turn Every Win Into a Viral Post
          </span>{' '}
          in 10 Seconds.
        </h1>

        <p className={styles.subheadline}>
          Paste any screenshot—a coding milestone, client message, email win, or
          study note—polish it inside a crisp Neobrutalist frame, generate
          native hooks for X, LinkedIn &amp; Reddit with AI, and share in 1
          click. No tab-switching. Zero screenshots or post history ever stored.
        </p>

        <div className={styles.heroCtaGroup}>
          <div className={styles.heroCtaButtons}>
            <LandingHeroCta />

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
            <span>Zero Post History Stored</span>
            <span className={styles.dotSep}>•</span>
            <span>X, LinkedIn &amp; Reddit</span>
          </div>
        </div>

        {/* Hero Split Visual (#before-after) */}
        <div id="before-after" className={styles.beforeAfterWrapper}>
          <div className={styles.beforeAfterGrid}>
            {/* Left: Before (Raw Unedited Screenshot) */}
            <div className={styles.beforeCard}>
              <div className={styles.beforeAfterHeader}>
                <span className="badge-brutal" style={{ fontSize: '0.7rem', backgroundColor: 'var(--card-bg-subtle)' }}>
                  <XMark size={12} />
                  <span>BEFORE: RAW UNEDITED SCREENSHOT</span>
                </span>
                <span className="tag-mono" style={{ fontSize: '0.7rem' }}>
                  Ignored in feed
                </span>
              </div>

              <div className={styles.rawMockBox}>
                <div className={styles.rawScreenshot}>
                  <div className={styles.rawTopStrip}>
                    <span>localhost:3000/dashboard - Chrome - Untitled</span>
                  </div>
                  <div className={styles.rawContent}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.7 }}>
                      Cluttered uncropped screenshot with browser tabs &amp; raw keys visible
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
                    Empty post composer... staring at cursor for 15 mins...
                  </span>
                  <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '4px' }}>
                    &ldquo;hey guys built this today check it out lol&rdquo;
                  </div>
                </div>
              </div>
            </div>

            {/* Right: After (MakeAPost 1-Tab Output) */}
            <div className={styles.afterCard}>
              <div className={styles.beforeAfterHeader}>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.7rem' }}>
                  <Check size={12} />
                  <span>AFTER: MAKEAPOST 1-TAB OUTPUT</span>
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
                      <span>Platform-Ready Hook + Hashtags</span>
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

      {/* 3. "Why We Built MakeAPost" — Old 4-Tab Chaos vs. MakeAPost 1-Tab Flow (#problem) */}
      <section id="problem" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-blue">WHY WE BUILT MAKEAPOST</div>
          <h2 className={styles.sectionTitle}>Old 4-Tab Chaos vs. MakeAPost 1-Tab Flow</h2>
          <p className={styles.sectionSubtitle}>
            Stop bouncing between design apps, AI chat tabs, and social composers just to share one update.
          </p>
        </div>

        <div className={styles.comparisonGrid}>
          {/* Before MakeAPost (4-Tab Friction) */}
          <div className={styles.compareCardOld}>
            <div className={styles.compareCardHeader}>
              <div className="badge-brutal" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#09090B' }}>
                <Clock size={13} />
                <span>BEFORE MAKEAPOST (4-TAB FRICTION)</span>
              </div>
              <span className="tag-mono">~15 mins / post</span>
            </div>

            <ol className={styles.workflowList}>
              <li>Take screenshot on your desktop or phone.</li>
              <li>Open Canva or Figma to crop, add padding, and frame it.</li>
              <li>Export file and hunt for it in your Downloads folder.</li>
              <li>Open ChatGPT to explain context and write post copy.</li>
              <li>Open X, LinkedIn, or Reddit and upload manually.</li>
            </ol>
          </div>

          {/* With MakeAPost (1-Tab Flow) */}
          <div className={styles.compareCardNew}>
            <div className={styles.compareCardHeader}>
              <div className="badge-brutal badge-yellow">
                <Zap size={13} />
                <span>WITH MAKEAPOST (1-TAB FLOW)</span>
              </div>
              <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem' }}>
                ~10 seconds
              </span>
            </div>

            <ol className={styles.workflowList}>
              <li>
                <strong>Ctrl+V</strong> screenshot directly onto the MakeAPost studio canvas.
              </li>
              <li>
                <strong>Style canvas in seconds</strong> with backgrounds, hard shadows, blur &amp; watermark control.
              </li>
              <li>
                <strong>AI reads visual context</strong> and writes tailored X, LinkedIn &amp; Reddit copy.
              </li>
              <li>
                <strong>1-click &ldquo;Share&rdquo;</strong> — auto-copies high-res PNG to clipboard &amp; opens native composer.
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

      {/* 4. Interactive Studio & Multi-Platform Preview + 6 Core Capabilities (#features) */}
      <section id="features" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-green">STUDIO &amp; AI PREVIEW</div>
          <h2 className={styles.sectionTitle}>Interactive Studio &amp; Multi-Platform Preview</h2>
          <p className={styles.sectionSubtitle}>
            Toggle real creator scenarios and target platforms to see how MakeAPost transforms raw screenshots into native posts.
          </p>
        </div>

        <LandingLivePreview />

        <div className={styles.capabilitiesWrap}>
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
        </div>
      </section>

      {/* 5. Transparent Monthly Pricing (#pricing) */}
      <section id="pricing" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-yellow">SIMPLE MONTHLY PRICING</div>
          <h2 className={styles.sectionTitle}>Start Free. Upgrade When You Scale.</h2>
          <p className={styles.sectionSubtitle}>
            No hidden fees. Google Sign-In keeps daily and monthly allowances fair for every creator.
          </p>
        </div>

        <LandingPricingSection />
      </section>

      {/* 6. Dedicated "Privacy-First Architecture" Trust Section (#privacy-architecture) */}
      <section id="privacy-architecture" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-yellow">PRIVACY-FIRST ARCHITECTURE</div>
          <h2 className={styles.sectionTitle}>Strict Data Minimalism. Honest by Design.</h2>
          <p className={styles.sectionSubtitle}>
            Your client messages, emails, and unpublished screenshots stay yours. Here is the exact breakdown of what touches our servers—and what never does.
          </p>
        </div>

        <div className={styles.privacyGrid}>
          {/* Left: What We NEVER Store */}
          <div className={styles.privacyNeverCard}>
            <div className={styles.compareCardHeader}>
              <div className="badge-brutal badge-green">
                <EyeOff size={13} />
                <span>WHAT WE NEVER STORE</span>
              </div>
              <span className="tag-mono" style={{ fontSize: '0.72rem' }}>0 BYTES SAVED</span>
            </div>

            <ul className={styles.privacyList}>
              <li>
                <XMark size={16} className={styles.privacyIconNo} />
                <span><strong>Zero uploaded screenshots</strong> — rendered locally in browser memory.</span>
              </li>
              <li>
                <XMark size={16} className={styles.privacyIconNo} />
                <span><strong>Zero edited images</strong> — exported straight to your clipboard or disk.</span>
              </li>
              <li>
                <XMark size={16} className={styles.privacyIconNo} />
                <span><strong>Zero generated post drafts or history</strong> — discarded as soon as you close the tab.</span>
              </li>
              <li>
                <XMark size={16} className={styles.privacyIconNo} />
                <span><strong>Zero X, LinkedIn, or Reddit passwords or OAuth tokens</strong> — 100% native web intents.</span>
              </li>
            </ul>
          </div>

          {/* Right: What Minimal Data We Store */}
          <div className={styles.privacyMinimalCard}>
            <div className={styles.compareCardHeader}>
              <div className="badge-brutal badge-blue">
                <Database size={13} />
                <span>WHAT MINIMAL DATA WE STORE</span>
              </div>
              <span className="tag-mono" style={{ fontSize: '0.72rem' }}>SUPABASE RLS</span>
            </div>

            <ul className={styles.privacyList}>
              <li>
                <Check size={16} className={styles.privacyIconYes} />
                <span><strong>Google OAuth identity</strong> — your email, display name, and avatar via Supabase Auth.</span>
              </li>
              <li>
                <Check size={16} className={styles.privacyIconYes} />
                <span><strong>Studio preferences</strong> — UI theme preference (Light/Dark) and default watermark setting.</span>
              </li>
              <li>
                <Check size={16} className={styles.privacyIconYes} />
                <span><strong>Operational counters &amp; billing metadata</strong> — daily usage counter and future subscription status metadata when applicable (never raw card numbers).</span>
              </li>
            </ul>

            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <Link href="/privacy" className="btn-brutal" style={{ fontSize: '0.84rem', padding: '8px 14px' }}>
                <ShieldCheck size={15} />
                <span>Read Full Privacy Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Crisp FAQ Accordion (#faq) */}
      <section id="faq" className={styles.sectionBlock}>
        <div className={styles.sectionHeadingGroup}>
          <div className="badge-brutal badge-yellow">FAQ</div>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
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
            No credit card. Zero screenshots or post history stored. Open the studio and paste your first capture in seconds.
          </p>
          <Link
            href="/editor"
            className={`btn-brutal btn-primary ${styles.heroBtn}`}
          >
            <Rocket size={17} />
            <span>Open Studio Free — No Card Needed</span>
          </Link>
        </div>
      </section>

      {/* 7. Reusable Footer */}
      <Footer />
    </div>
  );
}
