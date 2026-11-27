import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { RefreshCw, ArrowLeft, CreditCard, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'No-Refund & Billing Policy — MakeAPost',
  description:
    'Read the billing, all-sales-final, no-refund, and no-cancellation policy for MakeAPost (https://makeapost.site).',
  alternates: {
    canonical: '/refund',
  },
};

export default function RefundPage() {
  return (
    <div className={styles.legalContainer}>
      {/* Sticky Minimal Header */}
      <header className={styles.legalHeader}>
        <div className={styles.headerInner}>
          <Logo size={34} />
          <div className={styles.headerNav}>
            <Link href="/" className="btn-brutal" style={{ padding: '6px 14px', fontSize: '0.84rem' }}>
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
            <Link href="/editor" className="btn-brutal btn-primary" style={{ padding: '6px 14px', fontSize: '0.84rem' }}>
              Open Studio
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerMeta}>
            <span className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem' }}>
              <RefreshCw size={12} />
              <span>ALL SALES FINAL • NO REFUNDS</span>
            </span>
            <span className="tag-mono" style={{ fontSize: '0.75rem' }}>
              Last Updated: November 27, 2026
            </span>
          </div>
          <h1 className={styles.title}>No-Refund &amp; Billing Policy</h1>
          <p className={styles.subtitle}>
            Clear, upfront billing rules for MakeAPost Free, Pro ($7/mo), and Advanced ($15/mo) plans.
          </p>
        </div>

        <article className={styles.documentBody}>
          {/* Section 1 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle2 size={18} />
              <span>1. Try MakeAPost Free Before Upgrading</span>
            </h2>
            <p className={styles.sectionText}>
              We want you to be 100% confident before purchasing a paid plan. Every Google Sign-In automatically starts on our monthly auto-renewing <strong>Free Plan</strong> (3 image edits/day + 1 AI post per platform/day), and our built-in <strong>Code Snippet</strong> and <strong>SaaS Analytics</strong> sample images let you test canvas editing and AI post previews unlimited times with <strong>0 credits used</strong>.
            </p>
            <div className={styles.callout}>
              <p className={styles.sectionText} style={{ fontWeight: 700, color: 'var(--ink)' }}>
                Because every user can evaluate MakeAPost thoroughly for free prior to upgrading, all paid plan purchases are final.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <CreditCard size={18} />
              <span>2. No Refunds &amp; No Mid-Cycle Cancellations</span>
            </h2>
            <p className={styles.sectionText}>
              Paid monthly plans (Pro <code>$7/mo</code> and Advanced <code>$15/mo</code>) are billed upfront per monthly cycle via Dodo Payments:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>No Refunds Supported:</strong> MakeAPost does not offer refunds, partial credits, or prorated reimbursements once a paid plan charge has been processed.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>No Self-Serve Cancellation:</strong> Mid-cycle subscription cancellation is not supported inside the dashboard. Your paid tier remains active with full daily image editing and per-platform AI quotas for the entire paid billing cycle.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>
                  <strong>Billing Notifications:</strong> MakeAPost sends automated transactional emails (via Resend, alongside official Dodo Payments receipts) when your subscription activates, renews, expires, or requires payment attention.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <AlertCircle size={18} />
              <span>3. Failed Payments, Account Hold &amp; Duplicate Charges</span>
            </h2>
            <p className={styles.sectionText}>
              If a recurring renewal payment fails or is placed on hold by your card issuer, your account may temporarily enter an <code>on_hold</code> state or automatically revert to the monthly Free Plan (<code>3 image edits/day</code> + <code>1 AI post per platform/day</code>) with the default watermark restored until you choose to re-subscribe.
            </p>
            <p className={styles.sectionText} style={{ marginTop: '10px' }}>
              The only exception to our all-sales-final policy is a verified technical billing error—such as being accidentally charged twice for the same cycle due to a payment gateway glitch. If a verified duplicate charge occurs, please report it promptly so we can review the transaction with Dodo Payments.
            </p>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <HelpCircle size={18} />
              <span>4. Direct Billing Support &amp; Jurisdiction</span>
            </h2>
            <p className={styles.sectionText}>
              For duplicate charge reports or payment reference questions, please reach out with your Google account email and Dodo payment reference via our{' '}
              <Link href="/contact" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
                Contact Page
              </Link>{' '}
              or email our founder directly at{' '}
              <a href="mailto:adarshmishra70931@gmail.com" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
                adarshmishra70931@gmail.com
              </a>
              . MakeAPost is operated from <strong>India</strong>, and all billing terms are governed by the laws of India.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
