import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Home,
  Layers,
  ShieldCheck,
  Zap,
  Share2,
  ArrowRight,
  Cpu,
  CreditCard,
  MapPin,
} from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'About MakeAPost — Zero-Storage Screenshot & AI Post Studio',
  description:
    'Learn how MakeAPost combines a 70% client-side HTML5 Canvas screenshot editor with a 30% Multimodal AI Social Studio for X, LinkedIn, and Reddit.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className={styles.legalContainer}>
      <header className={styles.legalHeader}>
        <div className={styles.headerInner}>
          <Logo size={36} />

          <nav className={styles.headerNav}>
            <Link
              href="/"
              className="btn-brutal"
              style={{ padding: '6px 14px', fontSize: '0.84rem', gap: '6px' }}
            >
              <Home size={14} />
              <span className={styles.headerNavText}>Home</span>
            </Link>

            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.84rem', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span className={styles.headerNavText}>Studio</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerMeta}>
            <div
              className="badge-brutal badge-yellow"
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
            >
              <Layers size={13} />
              <span>COMPANY &amp; ARCHITECTURE</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              MAKEAPOST.SITE • INDIA
            </span>
          </div>

          <h1 className={styles.title}>About MakeAPost</h1>
          <p className={styles.subtitle}>
            MakeAPost is an independent, privacy-first creator SaaS built to turn raw screenshots
            into polished, platform-ready social posts for X, LinkedIn, and Reddit inside a single
            30/70 workspace.
          </p>
        </div>

        {/* 01 */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>01</div>
            <h2>The Problem We Solve</h2>
          </div>
          <p>
            Developers, indie hackers, and SaaS founders share product progress through screenshots:
            code snippets, terminal benchmarks, analytics dashboards, and customer wins. Previously,
            turning a raw screen capture into an engaging social post meant juggling Figma or Canva,
            a screenshot redaction tool, an AI chat tab, and three separate social media composers.
          </p>
          <div className={styles.callout}>
            <p>
              <strong>One Tab, 10 Seconds:</strong> Paste any image with <code>Ctrl+V</code> onto
              the 70% visual canvas, frame and redact sensitive data locally, generate native posts
              in the 30% AI sidebar, and publish in 1 click.
            </p>
          </div>
        </div>

        {/* 02 */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>02</div>
            <h2>Platform Capabilities</h2>
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>70% Client-Side HTML5 Canvas Engine:</strong> Instant framing with macOS /
                browser window mockups, aspect ratios (<code>auto</code>, <code>16:9</code>,{' '}
                <code>1:1</code>, <code>4:5</code>, <code>9:16</code>), 30 Studio &amp; Galaxy
                Cosmic backgrounds, and a 10-tool annotation suite (Pointer, Box, Circle, Arrow,
                Text, Blur Redaction, 2x Zoom Loupe, Highlighter, Spotlight, and Step Badges).
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>30% Multimodal AI Post Studio:</strong> Powered by Google Gemini Vision to
                read your canvas screenshot directly—including code, metrics, and annotations—and
                craft platform-tailored posts for X, LinkedIn, and Reddit across 6 tones (Build in
                Public, Ship &amp; Launch, Tech Breakdown, Viral Hook, Founder Story, How It Works).
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Unlimited 0-Credit Sample Mode:</strong> Test the full editor and AI post
                previews anytime using the built-in Code Snippet and SaaS Analytics samples with zero
                image or AI credits deducted.
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Zero-Token Native Social Sharing:</strong> Copies your crisp HD PNG to your
                device clipboard and launches the native X, LinkedIn, or Reddit composer with your
                copy pre-filled—eliminating third-party OAuth token risk.
              </span>
            </li>
          </ul>
        </div>

        {/* 03 */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>03</div>
            <h2>Zero-Storage Privacy &amp; Security</h2>
          </div>
          <p>
            MakeAPost is built on a strict <strong>stateless content architecture</strong>. Your
            screenshots, edited PNG exports, and AI-generated post drafts are never written to any
            database or cloud storage bucket. AI generation runs transiently in-memory using a
            compressed canvas snapshot and is discarded immediately after returning your post copy.
          </p>
          <p style={{ marginTop: '10px' }}>
            Only minimal account metadata—Google OAuth identity, UI theme, watermark preference,
            daily credit counters, and subscription status—is stored securely behind Supabase
            PostgreSQL Row Level Security (RLS) and tamper-proof database triggers.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '14px',
            }}
          >
            <span className="badge-brutal badge-yellow" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={13} />
              <span>Zero Screenshot Storage</span>
            </span>
            <span className="badge-brutal badge-blue" style={{ fontSize: '0.75rem' }}>
              <Cpu size={13} />
              <span>Google Gemini Vision</span>
            </span>
            <span className="badge-brutal" style={{ fontSize: '0.75rem' }}>
              <Share2 size={13} />
              <span>Native Web Intents</span>
            </span>
            <span className="badge-brutal" style={{ fontSize: '0.75rem' }}>
              <CreditCard size={13} />
              <span>Dodo Payments</span>
            </span>
          </div>
        </div>

        {/* 04 */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>04</div>
            <h2>Transparent Plans</h2>
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Free Plan ($0/mo):</strong> Automatically activated on first Google Sign-In
                (auto-renewed monthly). Includes 3 image edits/day, 1 AI post per platform/day, and
                the default MakeAPost watermark badge.
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Pro Plan ($7/mo):</strong> 30 image edits/day (900/month), 10 AI posts per
                platform/day (900/month), and Hide Watermark for clean unbranded exports.
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Advanced Plan ($15/mo):</strong> 50 image edits/day (1,500/month), 15 AI
                posts per platform/day (1,350/month), Hide Watermark, and Custom Brand Handle
                (<code>@handle</code> or domain badge).
              </span>
            </li>
          </ul>
        </div>

        {/* 05 */}
        <div className={styles.sectionCard} style={{ background: 'var(--bg-secondary)' }}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>05</div>
            <h2>Company &amp; Jurisdiction</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            <MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} />
            MakeAPost (<code>https://makeapost.site</code>) is an independent software product
            developed, owned, and operated by <strong>Adarsh Jayprakash Mishra</strong> in{' '}
            <strong>India</strong>. Direct inquiries:{' '}
            <a href="mailto:adarshmishra70931@gmail.com" style={{ fontWeight: 700, textDecoration: 'underline' }}>
              adarshmishra70931@gmail.com
            </a>
            .
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Link href="/founder" className="btn-brutal" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              Meet the Founder
            </Link>
            <Link href="/contact" className="btn-brutal" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              Contact Support
            </Link>
            <Link href="/privacy" className="btn-brutal" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              Privacy Policy
            </Link>
            <Link href="/editor" className="btn-brutal btn-primary" style={{ fontSize: '0.82rem', padding: '6px 14px', gap: '6px' }}>
              <span>Open Studio</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
