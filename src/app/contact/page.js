import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import {
  Mail,
  UserCheck,
  Trash2,
  KeyRound,
  ShieldAlert,
  Home,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Contact & Data Deletion — MakeAPost',
  description:
    'Need support or want your data completely deleted? Contact founder Adarsh Jayprakash Mishra or follow our step-by-step account and token deletion instructions.',
};

export default function ContactPage() {
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

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerMeta}>
            <div
              className="badge-brutal badge-yellow"
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
            >
              <UserCheck size={13} />
              <span>CREATOR SUPPORT & COMPLIANCE</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              RESPONSE TIME: &lt; 24 HOURS
            </span>
          </div>

          <h1 className={styles.title}>Contact & Data Deletion</h1>
          <p className={styles.subtitle}>
            Have questions, feedback, or want your account and connected OAuth tokens permanently wiped?
            Here is everything you need to reach out directly to the team or execute your data rights.
          </p>
        </div>

        {/* Founder Attribution Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>01</div>
            <h2>Built & Maintained with Care</h2>
          </div>
          <p>
            MakeAPost is an independent, creator-first SaaS platform designed and engineered by{' '}
            <strong>Adarsh Jayprakash Mishra</strong>. We prioritize user privacy, absolute transparency,
            and respect for intellectual property above everything else.
          </p>

          <div className={styles.callout}>
            <p>
              <strong>Direct Inquiries:</strong> Whether you encounter a bug, need an OAuth developer verification
              confirmation, have a feature request, or need expedited account removal, you are communicating directly
              with the founder and core maintainer.
            </p>
          </div>
        </div>

        {/* Direct Contact Channels */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>02</div>
            <h2>Support & Legal Contacts</h2>
          </div>
          <p>
            You can reach us through any of the following verified communication channels:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Mail size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Official Support Desk</h3>
              </div>
              <p style={{ fontSize: '0.86rem', margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>
                For general support, feedback, and technical assistance:
              </p>
              <a
                href="mailto:support@makeapost.app"
                className="btn-brutal"
                style={{
                  display: 'inline-flex',
                  fontSize: '0.82rem',
                  padding: '6px 12px',
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                }}
              >
                support@makeapost.app
              </a>
            </div>

            <div
              style={{
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <UserCheck size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Founder & Legal Lead</h3>
              </div>
              <p style={{ fontSize: '0.86rem', margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>
                Adarsh Jayprakash Mishra (Direct Escalations & Compliance):
              </p>
              <a
                href="mailto:adarshmishra70931@gmail.com"
                className="btn-brutal"
                style={{
                  display: 'inline-flex',
                  fontSize: '0.82rem',
                  padding: '6px 12px',
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                }}
              >
                adarshmishra70931@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Step-by-Step Data Deletion Instructions */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>03</div>
            <h2>Step-by-Step Data & Account Deletion</h2>
          </div>
          <p>
            In compliance with global data privacy frameworks (GDPR Article 17 Right to Erasure, CCPA, and platform
            developer policies for X, LinkedIn, and Reddit), you have full control over your stored credentials and records:
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginTop: '16px',
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                border: 'var(--border)',
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  STEP 1
                </span>
                <strong style={{ fontSize: '0.92rem' }}>Revoke OAuth Access from Social Providers</strong>
              </div>
              <p style={{ fontSize: '0.84rem', margin: 0, color: 'var(--text-secondary)' }}>
                You can immediately terminate MakeAPost&apos;s API access directly from the account security
                dashboard of the connected platform at any time:
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.82rem' }}>
                <li>
                  <strong>Google:</strong>{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    Google Account Permissions
                  </a>{' '}
                  &rarr; Select MakeAPost &rarr; Remove Access.
                </li>
                <li>
                  <strong>X (Twitter):</strong> Settings &amp; Privacy &rarr; Security and account access &rarr;
                  Connected apps &rarr; Revoke MakeAPost.
                </li>
                <li>
                  <strong>LinkedIn:</strong> Settings &amp; Privacy &rarr; Data privacy &rarr; Other applications &rarr;
                  Permitted services &rarr; Remove.
                </li>
                <li>
                  <strong>Reddit:</strong> User Settings &rarr; Safety &amp; Privacy &rarr; Manage third-party app
                  authorizations &rarr; Revoke.
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div
              style={{
                border: 'var(--border)',
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  STEP 2
                </span>
                <strong style={{ fontSize: '0.92rem' }}>Zero Social OAuth Tokens Stored</strong>
              </div>
              <p style={{ fontSize: '0.84rem', margin: 0, color: 'var(--text-secondary)' }}>
                MakeAPost operates via client-side native web intents (X, LinkedIn, Reddit) and device clipboard.
                We never request, store, or manage any social media access tokens, passwords, or API keys in our databases.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                border: 'var(--border)',
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  STEP 3
                </span>
                <strong style={{ fontSize: '0.92rem' }}>Permanent Account &amp; Profile Deletion</strong>
              </div>
              <p style={{ fontSize: '0.84rem', margin: 0, color: 'var(--text-secondary)' }}>
                To permanently wipe your entire user account, profile record, usage counters, and all linked associations
                from our Supabase PostgreSQL cluster, email{' '}
                <a href="mailto:support@makeapost.app?subject=Account%20Deletion%20Request" style={{ fontWeight: 600 }}>
                  support@makeapost.app
                </a>{' '}
                or{' '}
                <a href="mailto:adarshmishra70931@gmail.com?subject=Account%20Deletion%20Request" style={{ fontWeight: 600 }}>
                  adarshmishra70931@gmail.com
                </a>{' '}
                with the subject line <code>Account Deletion Request</code> from your registered email address.
              </p>
              <p style={{ fontSize: '0.82rem', marginTop: '8px', marginBottom: 0, color: 'var(--text-secondary)' }}>
                All deletion requests are verified and permanently executed within <strong>48 hours</strong>.
                Remember: since we operate on a <strong>Zero-Storage Architecture</strong>, no screenshots or generated
                social post copy ever reside in our systems.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Nav Card */}
        <div className={styles.sectionCard} style={{ background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.05rem', margin: '0 0 8px 0' }}>Review Our Legal Agreements</h3>
          <p style={{ fontSize: '0.88rem', margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
            Learn more about our strict privacy practices, terms of service, and refund policy:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Link href="/privacy" className="btn-brutal" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="btn-brutal" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              Terms of Service
            </Link>
            <Link href="/refund" className="btn-brutal" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              Refund &amp; Cancellation
            </Link>
            <Link href="/editor" className="btn-brutal btn-primary" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              Open Studio &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
