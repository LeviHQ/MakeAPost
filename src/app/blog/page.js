import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import BlogIndexClient from '@/components/BlogIndexClient';
import { BLOG_POSTS } from '@/lib/blogData';
import { BookOpen, Home, Sparkles } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Creator Blog & Playbooks (30 Guides)',
  description:
    '30 practical playbooks on screenshot beautification, X/LinkedIn/Reddit AI growth, Build in Public, API key redaction, and zero-storage creator workflows.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'MakeAPost Blog — 30 Screenshot & AI Social Growth Playbooks',
    description:
      'Deep guides for developers, indie hackers, and SaaS founders turning screenshots into viral X, LinkedIn, and Reddit posts.',
    url: '/blog',
  },
};

export default function BlogIndexPage() {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MakeAPost Creator Blog',
    url: 'https://makeapost.site/blog',
    description:
      'Practical guides on screenshot framing, multimodal AI social copywriting, privacy-first redaction, and Build in Public workflows.',
    publisher: {
      '@type': 'Organization',
      name: 'MakeAPost',
      url: 'https://makeapost.site',
    },
  };

  return (
    <div className={styles.legalContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
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

      <main className={styles.mainContent} style={{ maxWidth: '1080px' }}>
        <div className={styles.pageHeader}>
          <div className={styles.headerMeta}>
            <div
              className="badge-brutal badge-yellow"
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
            >
              <BookOpen size={13} />
              <span>CREATOR PLAYBOOKS • {BLOG_POSTS.length} GUIDES</span>
            </div>
            <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
              SCREENSHOTS • AI • PRIVACY
            </span>
          </div>

          <h1 className={styles.title}>MakeAPost Blog &amp; Playbooks</h1>
          <p className={styles.subtitle}>
            30 deep, actionable guides for developers, indie hackers, and SaaS founders on framing
            screenshots, redacting secrets, and writing high-converting posts for X, LinkedIn, and
            Reddit.
          </p>
        </div>

        <BlogIndexClient posts={BLOG_POSTS} />
      </main>

      <Footer />
    </div>
  );
}
