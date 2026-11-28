import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { XIcon, LinkedInIcon } from '@/components/SocialIcons';
import {
  UserCheck,
  Home,
  Sparkles,
  Code2,
  ShieldCheck,
  Mail,
  ArrowRight,
  ExternalLink,
  Globe,
  BookOpen,
  MapPin,
} from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Founder — Adarsh Jayprakash Mishra | MakeAPost',
  description:
    'Meet Adarsh Jayprakash Mishra, the India-based founder and solo engineer behind MakeAPost (https://makeapost.site).',
  alternates: {
    canonical: '/founder',
  },
};

export default function FounderPage() {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Adarsh Jayprakash Mishra',
    jobTitle: 'Founder & Software Engineer',
    url: 'https://makeapost.site/founder',
    email: 'mailto:adarshmishra70931@gmail.com',
    worksFor: {
      '@type': 'Organization',
      name: 'MakeAPost',
      url: 'https://makeapost.site',
    },
    sameAs: [
      'https://x.com/AdarshMi18',
      'https://www.linkedin.com/in/adarsh-jayprakash-msihra',
      'https://github.com/Code-By-Adarsh',
      'https://codebyadarsh.me',
      'https://medium.com/@codebyadarsh',
    ],
  };

  return (
    <div className={styles.legalContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
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
              <UserCheck size={13} />
              <span>FOUNDER &amp; SOLO ENGINEER</span>
            </div>
            <span
              className="tag-mono"
              style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <MapPin size={12} />
              <span>INDIA • MAKEAPOST.SITE</span>
            </span>
          </div>

          <h1 className={styles.title}>Adarsh Jayprakash Mishra</h1>
          <p className={styles.subtitle}>
            Independent software engineer and founder of MakeAPost — designing fast, privacy-first
            creative tools for developers, indie hackers, and SaaS founders worldwide.
          </p>
        </div>

        {/* 01: Origin Story */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>01</div>
            <h2>Why I Built MakeAPost</h2>
          </div>
          <p>
            Every time I shipped a feature, fixed a tough bug, or hit a milestone, sharing it online
            felt harder than building the feature itself. First I had to crop and beautify the
            screenshot in a design tool, manually blur sensitive API keys or customer emails, open an
            AI chat window to draft a hook, and then copy-paste everything separately into X,
            LinkedIn, and Reddit.
          </p>
          <p style={{ marginTop: '10px' }}>
            Existing tools either forced heavy subscriptions just to frame a screenshot or stored
            private user uploads on third-party servers. I built MakeAPost to fix both problems at
            once: a <strong>single-tab, zero-storage 30/70 workspace</strong> where your canvas
            editor and AI social writer live side-by-side.
          </p>
        </div>

        {/* 02: Engineering & Privacy Philosophy */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>02</div>
            <h2>Engineering &amp; Product Principles</h2>
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Client-First Speed &amp; Zero Storage:</strong> All canvas framing,
                gradients, cosmic backgrounds, annotations, and blur boxes run locally in your
                browser&apos;s HTML5 <code>&lt;canvas&gt;</code>. Nothing is ever uploaded to
                permanent cloud buckets.
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>No Social Media Passwords or OAuth Risk:</strong> Instead of asking for
                write-access OAuth tokens to your X, LinkedIn, or Reddit account, MakeAPost copies
                your high-res graphic to your clipboard and opens the native web composer directly.
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Test Everything Free First:</strong> Every Google Sign-In automatically
                receives a monthly auto-renewing Free Plan, plus unlimited 0-credit Sample Mode
                testing so you never have to guess before upgrading.
              </span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listBullet} />
              <span>
                <strong>Direct Founder Accountability:</strong> MakeAPost is operated independently
                from India. Every bug report, billing inquiry, and GDPR/data deletion request is
                handled directly by me — never outsourced to automated ticket bots.
              </span>
            </li>
          </ul>
        </div>

        {/* 03: Connect & Social Profiles */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>03</div>
            <h2>Connect with Adarsh</h2>
          </div>
          <p>
            Follow my build-in-public updates, open-source code, technical writing, or reach out
            directly for product feedback and support:
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '14px',
            }}
          >
            <a
              href="https://x.com/AdarshMi18"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '7px', textDecoration: 'none' }}
            >
              <XIcon size={13} />
              <span>X (@AdarshMi18)</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://www.linkedin.com/in/adarsh-jayprakash-msihra"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '7px', textDecoration: 'none' }}
            >
              <LinkedInIcon size={14} />
              <span>LinkedIn</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://github.com/Code-By-Adarsh"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '7px', textDecoration: 'none' }}
            >
              <Code2 size={14} />
              <span>GitHub (Code-By-Adarsh)</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://codebyadarsh.me"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '7px', textDecoration: 'none' }}
            >
              <Globe size={14} />
              <span>Portfolio (codebyadarsh.me)</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://medium.com/@codebyadarsh"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '7px', textDecoration: 'none' }}
            >
              <BookOpen size={14} />
              <span>Medium (@codebyadarsh)</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* 04: Direct Support & Navigation */}
        <div className={styles.sectionCard} style={{ background: 'var(--bg-secondary)' }}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>04</div>
            <h2>Direct Support &amp; Inquiries</h2>
          </div>
          <p>
            Need help with your MakeAPost account, billing, or data deletion? Email me directly or
            submit a message via the Contact form:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
            <a
              href="mailto:adarshmishra70931@gmail.com"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '6px', textDecoration: 'none' }}
            >
              <Mail size={14} />
              <span>adarshmishra70931@gmail.com</span>
            </a>

            <Link
              href="/contact"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '6px' }}
            >
              <ShieldCheck size={14} />
              <span>Open Contact Form</span>
            </Link>

            <Link
              href="/about"
              className="btn-brutal"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '6px' }}
            >
              <span>About MakeAPost</span>
            </Link>

            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 14px', gap: '6px' }}
            >
              <span>Open Studio</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
