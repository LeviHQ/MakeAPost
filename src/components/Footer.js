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
  BookOpen,
  Scale,
  Bot,
} from 'lucide-react';
import styles from './Footer.module.css';

const ASK_AI_QUERY = encodeURIComponent(
  'Summarize MakeAPost (https://makeapost.site): its 30/70 screenshot studio, 30 Cosmic & Neon backgrounds, Multimodal AI post generator for X/LinkedIn/Reddit, zero-storage privacy architecture, 0-credit sample mode, and Free/Pro/Advanced plans.'
);

const AI_ASSISTANTS = [
  { name: 'ChatGPT', href: `https://chatgpt.com/?q=${ASK_AI_QUERY}` },
  { name: 'Claude', href: `https://claude.ai/new?q=${ASK_AI_QUERY}` },
  { name: 'Perplexity', href: `https://www.perplexity.ai/search?q=${ASK_AI_QUERY}` },
  { name: 'Gemini', href: `https://gemini.google.com/app?q=${ASK_AI_QUERY}` },
  { name: 'Copilot', href: `https://copilot.microsoft.com/?q=${ASK_AI_QUERY}` },
  { name: 'Grok', href: `https://x.com/i/grok?text=${ASK_AI_QUERY}` },
  { name: 'DeepSeek', href: `https://chat.deepseek.com/?q=${ASK_AI_QUERY}` },
];

const AI_ENDPOINTS = [
  '/llms.txt',
  '/llms-full.txt',
  '/ai.txt',
  '/ai-snapshot.json',
  '/openapi.json',
  '/sitemap.xml',
  '/robots.txt',
];

export default function Footer({ className = '' }) {
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Column 1: Brand & Core Mission */}
          <div className={styles.brandCol}>
            <Logo size={36} />
            <p className={styles.tagline}>
              Turn raw screenshots into viral social posts in seconds. Frame on our 70%
              HTML5 Canvas &amp; generate tailored X, LinkedIn, and Reddit posts in one tab.
            </p>
            <div className={styles.brandBadges}>
              <div className="badge-brutal badge-yellow" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                <ShieldCheck size={12} />
                <span>Zero Database Storage</span>
              </div>
              <div className="badge-brutal badge-blue" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                <Sparkles size={12} />
                <span>Client-Side Canvas</span>
              </div>
              <div className="badge-brutal" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                <Lock size={11} />
                <span>Zero Social OAuth</span>
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
                <Link href="/blog" className={styles.footerLink}>
                  <BookOpen size={13} />
                  <span>Creator Blog (30)</span>
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

          {/* Column 3: Alternatives (5 Competitor Comparisons) */}
          <div className={styles.col}>
            <div className={styles.colTitle}>Alternatives</div>
            <ul className={styles.linkList}>
              <li>
                <Link href="/alternatives/shots-so" className={styles.footerLink}>
                  <Scale size={13} />
                  <span>vs Shots.so</span>
                </Link>
              </li>
              <li>
                <Link href="/alternatives/carbon" className={styles.footerLink}>
                  <Scale size={13} />
                  <span>vs Carbon</span>
                </Link>
              </li>
              <li>
                <Link href="/alternatives/ray-so" className={styles.footerLink}>
                  <Scale size={13} />
                  <span>vs Ray.so</span>
                </Link>
              </li>
              <li>
                <Link href="/alternatives/canva" className={styles.footerLink}>
                  <Scale size={13} />
                  <span>vs Canva</span>
                </Link>
              </li>
              <li>
                <Link href="/alternatives/buffer-typefully" className={styles.footerLink}>
                  <Scale size={13} />
                  <span>vs Typefully &amp; Buffer</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
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

          {/* Column 5: Legal & Compliance */}
          <div className={styles.col}>
            <div className={styles.colTitle}>Legal</div>
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
        </div>

        {/* GEO / AEO Strip: Ask AI + Machine-Readable Crawler Endpoints */}
        <div className={styles.aiVisibilityBar}>
          <div>
            <div className={styles.aiSectionHeader}>
              <span className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                <Bot size={11} />
                <span>AI</span>
              </span>
              <span>Ask AI About MakeAPost</span>
              <span className={styles.aiSectionSub}>(1-Click Verified Queries)</span>
            </div>
            <div className={styles.aiButtonGrid}>
              {AI_ASSISTANTS.map((ai) => (
                <a
                  key={ai.name}
                  href={ai.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.aiQueryBtn}
                >
                  <span>{ai.name}</span>
                  <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </div>

          <div className={styles.aiEndpointsCol}>
            <div className={styles.aiSectionHeader}>
              <span>For AI Agents &amp; Crawlers</span>
              <span className={styles.aiSectionSub}>(Specifications &amp; Endpoints)</span>
            </div>
            <div className={styles.endpointList}>
              {AI_ENDPOINTS.map((ep) => (
                <a
                  key={ep}
                  href={ep}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.endpointLink}
                >
                  {ep}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <span>&copy; {new Date().getFullYear()} MakeAPost.</span>
            <span>All rights reserved.</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>Operated in India</span>
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
