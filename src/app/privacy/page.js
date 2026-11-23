import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  Share2,
  Trash2,
  Home,
  Sparkles,
} from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Privacy Policy — MakeAPost',
  description:
    'Our privacy policy explains how MakeAPost handles your data with a strict zero-storage architecture, transient AI processing, and secure OAuth tokens.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.legalContainer}>
      {/* Top Header */}
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

      {/* Main Legal Content */}
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerMeta}>
            <div className="badge-brutal badge-yellow" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
              <Lock size={13} />
              <span>LEGAL COMPLIANCE</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              LAST UPDATED: NOVEMBER 2026
            </span>
          </div>

          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <p className={styles.pageSubtitle}>
            At MakeAPost, we believe privacy is not an afterthought — it is engineered directly into our architecture.
            We operate on a strict <strong>Zero-Database-Storage</strong> policy for all visual and generated content.
          </p>
        </div>

        <article className={styles.contentCard}>
          {/* Section 1 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <EyeOff size={18} />
              <span>1. Zero-Storage Visual &amp; Content Architecture</span>
            </h2>
            <p className={styles.sectionText}>
              When you paste, drop, or upload screenshots into MakeAPost, your images are rendered entirely on your
              device using the native client-side HTML5 Canvas API.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>No Image Persistence:</strong> Your screenshots are never stored on any server, persistent disk,
                  or cloud database bucket. Once you refresh or close the tab, the image buffer in your browser memory is erased.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>No Draft Logging:</strong> Generated post copy (X threads, LinkedIn posts, Reddit discussions) is delivered directly to your browser memory and is never logged or archived in any database.
                </span>
              </li>
            </ul>

            <div className={styles.callout}>
              <div className={styles.calloutTitle}>
                <ShieldCheck size={14} />
                <span>Client-Side Guarantee</span>
              </div>
              <div className={styles.calloutText}>
                All framing, gradient renders, blurring of sensitive API credentials, and HD PNG downloads happen 100% on your machine.
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Server size={18} />
              <span>2. Third-Party AI Vision Processing (Google Gemini)</span>
            </h2>
            <p className={styles.sectionText}>
              When you choose to utilize the <strong>AI Post Mode</strong>, your screenshot is compressed client-side (JPEG, 768px max width)
              and server-side (Sharp downscale to 640px) to minimize token footprint before being sent via encrypted HTTPS (TLS 1.3)
              to the Google Gemini Vision API (<code>gemini-2.5-flash</code>).
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Transient Analysis:</strong> The visual data is parsed in-memory solely to generate the requested social post drafts matching your chosen tone and context.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>No Model Training:</strong> Under Google Cloud developer enterprise API terms, customer API prompts and visual inputs are not retained or utilized to train future public foundation models.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Lock size={18} />
              <span>3. User Accounts &amp; Supabase PostgreSQL Storage</span>
            </h2>
            <p className={styles.sectionText}>
              To prevent anonymous scraper bot abuse and enable cross-device preference sync, MakeAPost provides Google OAuth login powered by Supabase.
              We only collect and store the absolute minimum data required to operate your account:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Profile Information:</strong> Your Google email address, display name, and avatar picture URL.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Studio Preferences:</strong> Your selected UI theme preference (<code>light</code> or <code>dark</code> mode).
                </span>
              </li>
            </ul>
            <p className={styles.sectionText}>
              All user records are secured behind PostgreSQL Row Level Security (RLS) policies, ensuring users can only read and update their own profiles.
            </p>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Share2 size={18} />
              <span>4. Connected Social Accounts (OAuth 2.0 Security)</span>
            </h2>
            <p className={styles.sectionText}>
              When you connect third-party platforms (such as X/Twitter, LinkedIn, or Reddit) to publish posts:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Encrypted Credentials:</strong> OAuth 2.0 access and refresh tokens are encrypted at rest using industry-standard AES-256-GCM.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Explicit Action Only:</strong> MakeAPost will NEVER post, read private direct messages, or alter your account without your explicit, real-time click on the "Publish" button.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Instant Revocation:</strong> You can disconnect your social accounts at any time from your Account Settings, which permanently purges the stored access tokens.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Trash2 size={18} />
              <span>5. Data Deletion Rights (GDPR &amp; CCPA)</span>
            </h2>
            <p className={styles.sectionText}>
              You have complete ownership and control over your data. You may request permanent deletion of your account and all associated profile attributes at any time by visiting our{' '}
              <Link href="/contact" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
                Contact &amp; Data Deletion page
              </Link>{' '}
              or emailing us at <code>privacy@makeapost.app</code>. Upon receiving your verified request, all records are permanently deleted within 48 business hours.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
