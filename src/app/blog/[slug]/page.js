import Link from 'next/link';
import { notFound } from 'next/navigation';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { BLOG_POSTS, BLOG_POSTS_MAP } from '@/lib/blogData';
import {
  Home,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import styles from '../../legal.module.css';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = BLOG_POSTS_MAP[slug];
  if (!post) return { title: 'Article Not Found' };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: `${post.publishedAt}T00:00:00Z`,
      authors: ['Adarsh Jayprakash Mishra'],
    },
  };
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const post = BLOG_POSTS_MAP[slug];
  if (!post) notFound();

  const relatedPosts = (post.relatedSlugs || [])
    .map((s) => BLOG_POSTS_MAP[s])
    .filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: `${post.publishedAt}T00:00:00Z`,
        dateModified: `${post.publishedAt}T00:00:00Z`,
        author: {
          '@type': 'Person',
          name: 'Adarsh Jayprakash Mishra',
          url: 'https://makeapost.site/founder',
        },
        publisher: {
          '@type': 'Organization',
          name: 'MakeAPost',
          url: 'https://makeapost.site',
          logo: {
            '@type': 'ImageObject',
            url: 'https://makeapost.site/icons/icon-512.png',
          },
        },
        mainEntityOfPage: `https://makeapost.site/blog/${post.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://makeapost.site/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://makeapost.site/blog' },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://makeapost.site/blog/${post.slug}`,
          },
        ],
      },
      ...(post.faqs?.length
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: post.faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

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
              href="/blog"
              className="btn-brutal"
              style={{ padding: '6px 14px', fontSize: '0.84rem', gap: '6px' }}
            >
              <ArrowLeft size={14} />
              <span className={styles.headerNavText}>All Guides</span>
            </Link>
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
              <BookOpen size={13} />
              <span>{post.category.toUpperCase()}</span>
            </div>
            <span
              className="tag-mono"
              style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Clock size={12} />
              <span>{post.readingTime}</span>
            </span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.subtitle}>{post.description}</p>
        </div>

        {/* Direct AEO Answer Box */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>TL;DR</div>
            <h2>Direct Answer</h2>
          </div>
          <div className={styles.callout}>
            <p>{post.directAnswer}</p>
          </div>
        </div>

        {/* Deep Article Sections */}
        {post.sections.map((section, idx) => (
          <div key={section.heading} className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionNumber}>0{idx + 1}</div>
              <h2>{section.heading}</h2>
            </div>
            {section.paragraphs.map((para) => (
              <p key={para.slice(0, 40)} style={{ marginTop: '8px' }}>
                {para}
              </p>
            ))}
          </div>
        ))}

        {/* Key Takeaways */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>KEY</div>
            <h2>Key Takeaways</h2>
          </div>
          <ul className={styles.list}>
            {post.keyTakeaways.map((tip) => (
              <li key={tip} className={styles.listItem}>
                <span className={styles.listBullet} />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article FAQs */}
        {post.faqs?.length > 0 && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionNumber}>FAQ</div>
              <h2>Common Questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {post.faqs.map((f) => (
                <div
                  key={f.q}
                  style={{
                    padding: '12px 14px',
                    border: 'var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      marginBottom: '6px',
                    }}
                  >
                    <HelpCircle size={14} />
                    <span>{f.q}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Studio CTA & Related Reads */}
        <div className={styles.sectionCard} style={{ background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.08rem', margin: '0 0 8px 0' }}>
            Put This Playbook Into Action in 10 Seconds
          </h3>
          <p style={{ fontSize: '0.88rem', margin: '0 0 14px 0', color: 'var(--text-secondary)' }}>
            Open MakeAPost Studio, paste a screenshot with Ctrl+V (or test our 0-credit Samples),
            and generate tailored X, LinkedIn, and Reddit posts in one tab.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', gap: '6px' }}
            >
              <CheckCircle2 size={14} />
              <span>Open MakeAPost Studio</span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/blog" className="btn-brutal" style={{ fontSize: '0.84rem', padding: '8px 14px' }}>
              Browse All 30 Guides
            </Link>
          </div>

          {relatedPosts.length > 0 && (
            <>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Related Guides:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="btn-brutal"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    {rel.title}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
