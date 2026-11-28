import Link from 'next/link';
import { notFound } from 'next/navigation';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { ALTERNATIVES_LIST, ALTERNATIVES_MAP } from '@/lib/alternativesData';
import {
  Home,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Scale,
  HelpCircle,
} from 'lucide-react';
import styles from '../../legal.module.css';

export function generateStaticParams() {
  return ALTERNATIVES_LIST.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const alt = ALTERNATIVES_MAP[slug];
  if (!alt) return { title: 'Alternative Comparison' };

  return {
    title: alt.title,
    description: alt.description,
    keywords: alt.keywords,
    alternates: {
      canonical: `/alternatives/${alt.slug}`,
    },
    openGraph: {
      title: alt.title,
      description: alt.description,
      url: `/alternatives/${alt.slug}`,
      type: 'article',
    },
  };
}

export default async function AlternativeComparisonPage({ params }) {
  const { slug } = await params;
  const alt = ALTERNATIVES_MAP[slug];
  if (!alt) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://makeapost.site/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: `MakeAPost vs ${alt.competitorName}`,
            item: `https://makeapost.site/alternatives/${alt.slug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: alt.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  const otherAlternatives = ALTERNATIVES_LIST.filter((item) => item.slug !== alt.slug);

  return (
    <div className={styles.legalContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
              <span className={styles.headerNavText}>Open Studio</span>
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
              <Scale size={13} />
              <span>{alt.heroBadge}</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              COMPARISON GUIDE
            </span>
          </div>

          <h1 className={styles.title}>{alt.title}</h1>
          <p className={styles.subtitle}>{alt.description}</p>
        </div>

        {/* Direct AEO Answer Summary */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>01</div>
            <h2>Quick Answer: MakeAPost vs {alt.competitorName}</h2>
          </div>
          <div className={styles.callout}>
            <p>{alt.summaryAnswer}</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>02</div>
            <h2>Side-by-Side Feature Comparison</h2>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.86rem',
                border: '2px solid var(--border-color)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'var(--accent-yellow)', color: '#09090B' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                    Capability
                  </th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                    MakeAPost
                  </th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                    {alt.competitorName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {alt.comparisonRows.map((row) => (
                  <tr key={row.feature} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{row.feature}</td>
                    <td style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)' }}>
                      {row.makeapost}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>
                      {row.competitor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* When to Choose Each */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>03</div>
            <h2>When Should You Choose MakeAPost?</h2>
          </div>
          <ul className={styles.list}>
            {alt.whenMakeapostWins.map((point) => (
              <li key={point} className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              border: '1.5px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--card-bg-subtle)',
              fontSize: '0.86rem',
            }}
          >
            <strong>When {alt.competitorName} may still fit:</strong>{' '}
            {alt.whenCompetitorFits.join(' ')}
          </div>
        </div>

        {/* FAQs */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>04</div>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {alt.faqs.map((f) => (
              <div
                key={f.q}
                style={{
                  padding: '12px 14px',
                  border: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '6px' }}>
                  <HelpCircle size={14} />
                  <span>{f.q}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA & Other Comparisons */}
        <div className={styles.sectionCard} style={{ background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.08rem', margin: '0 0 8px 0' }}>
            Try MakeAPost Free (No Credit Card Required)
          </h3>
          <p style={{ fontSize: '0.88rem', margin: '0 0 14px 0', color: 'var(--text-secondary)' }}>
            Test framing, blur redaction, 30 Neon &amp; Cosmic backgrounds, and AI post generation in one tab.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <Link href="/editor" className="btn-brutal btn-primary" style={{ fontSize: '0.84rem', padding: '8px 16px', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>Open MakeAPost Studio</span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/blog" className="btn-brutal" style={{ fontSize: '0.84rem', padding: '8px 14px' }}>
              Read 30 Creator Guides
            </Link>
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            Other Comparisons:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {otherAlternatives.map((item) => (
              <Link
                key={item.slug}
                href={`/alternatives/${item.slug}`}
                className="btn-brutal"
                style={{ fontSize: '0.78rem', padding: '5px 10px' }}
              >
                vs {item.competitorName}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
