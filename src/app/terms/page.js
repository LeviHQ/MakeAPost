import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Award,
  Share2,
  HelpCircle,
  Home,
  Sparkles,
} from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Terms of Service — MakeAPost',
  description:
    'Terms of Service governing the use of MakeAPost. You own 100% of your screenshots and generated posts.',
};

export default function TermsPage() {
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
              <FileText size={13} />
              <span>TERMS &amp; CONDITIONS</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              LAST REVISED: NOVEMBER 2026
            </span>
          </div>

          <h1 className={styles.pageTitle}>Terms of Service</h1>
          <p className={styles.pageSubtitle}>
            Welcome to MakeAPost. By accessing or using our application, you agree to be bound by these Terms of Service.
            Please review them carefully.
          </p>
        </div>

        <article className={styles.contentCard}>
          {/* Section 1 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle2 size={18} />
              <span>1. Agreement to Terms</span>
            </h2>
            <p className={styles.sectionText}>
              By visiting our website or utilizing the MakeAPost studio at <code>makeapost.app</code>, you confirm that you are at least 13 years of age and legally capable of entering into this agreement. If you are using the service on behalf of an organization, you represent that you have authority to bind that entity to these terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Award size={18} />
              <span>2. Intellectual Property &amp; 100% User Ownership</span>
            </h2>
            <p className={styles.sectionText}>
              We believe creators should own their creations. MakeAPost asserts zero claim over your work:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Your Screenshots:</strong> You retain complete, unrestricted copyright and ownership over all original screenshots, graphics, code snippets, and media uploaded to the canvas.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Generated Copy:</strong> You own 100% of all generated post copy (for X, LinkedIn, and Reddit) produced via the AI studio. You are free to publish, monetize, commercialize, or edit this text without any royalties or licensing fees.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>MakeAPost Branding:</strong> The MakeAPost name, Neobrutalist design tokens, logo components, and source code are the intellectual property of MakeAPost and its creator, Adarsh Jayprakash Mishra.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <AlertTriangle size={18} />
              <span>3. Acceptable Use Policy</span>
            </h2>
            <p className={styles.sectionText}>
              You agree not to misuse MakeAPost or assist anyone else in doing so. Specifically, you may not:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>Upload or generate content that is unlawful, defamatory, hateful, harassing, sexually explicit, or promotes violence.</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>Attempt to reverse-engineer, decompile, or extract proprietary backend algorithms from MakeAPost.</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>Launch automated scraper scripts, bot attacks, or attempt to overwhelm our API generation endpoints.</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>Violate the developer terms, API usage guidelines, or spam policies of connected third-party platforms (X/Twitter, LinkedIn, Reddit).</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Share2 size={18} />
              <span>4. Third-Party Services &amp; Social Integration</span>
            </h2>
            <p className={styles.sectionText}>
              MakeAPost integrates with Google OAuth for authentication, Google Gemini for visual understanding, and third-party social APIs (X, LinkedIn, Reddit). Your interactions with these services are subject to their respective terms and privacy policies. MakeAPost is not responsible for suspensions, algorithm changes, or account actions taken by external platforms.
            </p>
          </section>

          {/* Section 5 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <HelpCircle size={18} />
              <span>5. Disclaimers &amp; Limitation of Liability</span>
            </h2>
            <p className={styles.sectionText}>
              MakeAPost is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
              While we optimize prompts for high social engagement, we make no guarantee that generated posts will achieve viral reach or specific marketing metrics.
              To the maximum extent permitted by law, MakeAPost and its founder shall not be liable for any indirect, incidental, or consequential damages resulting from the use of the platform.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
