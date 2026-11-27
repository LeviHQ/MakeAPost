import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import {
  RefreshCw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Home,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Refund & Cancellation Policy — MakeAPost',
  description:
    'Transparent Refund and Cancellation Policy for MakeAPost (https://makeapost.site). Free core access, zero hidden lock-ins, and fair refund evaluation.',
  alternates: {
    canonical: '/refund',
  },
};

export default function RefundPage() {
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
              <CreditCard size={13} />
              <span>BILLING &amp; REFUNDS</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              EFFECTIVE: NOVEMBER 2026
            </span>
          </div>

          <h1 className={styles.pageTitle}>Refund &amp; Cancellation Policy</h1>
          <p className={styles.pageSubtitle}>
            We believe in honest, fair business practices. Here is our straightforward refund and cancellation policy
            with zero hidden lock-ins or surprise fees.
          </p>
        </div>

        <article className={styles.contentCard}>
          {/* Section 1 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle2 size={18} />
              <span>1. 100% Free Core Access &amp; No Credit Card Required</span>
            </h2>
            <p className={styles.sectionText}>
              All core features of MakeAPost — including the 70% Canvas Image Beautifier, high-resolution PNG exports, and AI Post Generation for X, LinkedIn, and Reddit — are currently available completely free of charge upon signing in with Google.
            </p>
            <div className={styles.callout}>
              <div className={styles.calloutTitle}>
                <ShieldCheck size={14} />
                <span>Zero Financial Risk</span>
              </div>
              <div className={styles.calloutText}>
                You will never be asked for credit card details to use the current free version of MakeAPost.
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <RefreshCw size={18} />
              <span>2. Monthly Subscription Terms</span>
            </h2>
            <p className={styles.sectionText}>
              Paid monthly plans (Pro `$7/mo` and Advanced `$15/mo`) are billed upfront per monthly cycle via Dodo Payments:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Active Billing Cycle:</strong> Subscriptions remain active for the paid billing period with full daily image editing and per-platform AI quotas. Self-serve mid-cycle cancellation is not offered inside the dashboard.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Billing Notifications:</strong> MakeAPost sends automated transactional emails (via Resend, alongside official Dodo Payments receipts) when your subscription activates, renews, expires, or requires payment attention.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Billing Support:</strong> For duplicate charges or urgent billing inquiries, please reach out directly to <code>billing@makeapost.site</code> or use our{' '}
                  <Link href="/contact" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
                    Contact form
                  </Link>
                  .
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <AlertCircle size={18} />
              <span>3. Refund Terms &amp; Eligibility</span>
            </h2>
            <p className={styles.sectionText}>
              For any future paid transactions, we maintain a customer-friendly <strong>14-day refund policy</strong> under the following conditions:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Billing Errors &amp; Duplicate Charges:</strong> If you are accidentally billed multiple times or charged in error, we will issue an immediate 100% refund.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Service Outages:</strong> If MakeAPost experiences severe, prolonged platform unavailability preventing you from using your plan, you are entitled to a full or prorated refund.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>14-Day Window:</strong> Refund requests must be submitted within 14 calendar days of the charge date to be eligible.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <HelpCircle size={18} />
              <span>4. How to Request a Refund</span>
            </h2>
            <p className={styles.sectionText}>
              To request a refund or raise a billing question, please contact us with your Google account email and payment reference via our{' '}
              <Link href="/contact" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
                Contact Page
              </Link>{' '}
              or email us directly at <code>billing@makeapost.site</code>. We review and process all eligible refund requests within 24 to 48 business hours.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
