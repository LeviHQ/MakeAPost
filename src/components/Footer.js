import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  ShieldCheck,
  FileText,
  Lock,
  RefreshCw,
  Mail,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Building2,
  UserCheck,
} from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer({ className = '' }) {
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Column 1: Brand & Core Mission */}
          <div className={styles.brandCol}>
            <Logo size={36} />
            <p className={styles.tagline}>
              Turn raw screenshots into viral social posts in seconds. Edit your
              image &amp; generate tailored X, LinkedIn, and Reddit posts in one screen.
            </p>
            <div className={styles.brandBadges}>
              <div className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                <ShieldCheck size={12} />
                <span>Zero Database Storage</span>
              </div>
              <div className="badge-brutal badge-blue" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                <Sparkles size={12} />
                <span>Client-Side Canvas</span>
              </div>
            </div>
          </div>

          {/* Column 2: Product & Studio */}
          <div className={styles.col}>
            <div className={styles.colTitle}>Product</div>
            <ul className={styles.linkList}>
              <li>
                <Link href="/editor" className={styles.footerLink}>
                  <span>Studio Editor</span>
                  <ArrowRight size={12} />
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className={styles.footerLink}>
                  <span>Pricing Plans</span>
                </Link>
              </li>
              <li>
                <Link href="/settings" className={styles.footerLink}>
                  <span>Account &amp; Settings</span>
                </Link>
              </li>
              <li>
                <Link href="/" className={styles.footerLink}>
                  <span>Home</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className={styles.col}>
            <div className={styles.colTitle}>Company</div>
            <ul className={styles.linkList}>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  <Building2 size={13} />
                  <span>About MakeAPost</span>
                </Link>
              </li>
              <li>
                <Link href="/founder" className={styles.footerLink}>
                  <UserCheck size={13} />
                  <span>Founder</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  <Mail size={13} />
                  <span>Contact &amp; Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div className={styles.col}>
            <div className={styles.colTitle}>Legal &amp; Compliance</div>
            <ul className={styles.linkList}>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  <Lock size={13} />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  <FileText size={13} />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/refund" className={styles.footerLink}>
                  <RefreshCw size={13} />
                  <span>No-Refund &amp; Billing</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  <ShieldCheck size={13} />
                  <span>Data Deletion</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Architecture & Trust */}
          <div className={styles.col}>
            <div className={styles.colTitle}>Trust &amp; Privacy</div>
            <ul className={styles.linkList}>
              <li style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                Stateless content generation. No screenshots or generated drafts are ever logged, stored, or sold.
              </li>
              <li>
                <div className="tag-mono" style={{ fontSize: '0.72rem' }}>
                  GOOGLE GEMINI VISION
                </div>
              </li>
              <li>
                <div className="tag-mono" style={{ fontSize: '0.72rem' }}>
                  SUPABASE POSTGRESQL
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <span>&copy; {new Date().getFullYear()} MakeAPost.</span>
            <span>All rights reserved.</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>Zero Post History Stored</span>
          </div>

          <div className={styles.founderNote}>
            <span>Built by Adarsh Jayprakash Mishra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
