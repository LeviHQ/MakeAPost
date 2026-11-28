'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BLOG_CATEGORIES } from '@/lib/blogData';
import { ArrowRight, Clock, Tag } from 'lucide-react';

export default function BlogIndexClient({ posts }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts =
    activeCategory === 'All'
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Category Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {BLOG_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const count =
            cat === 'All' ? posts.length : posts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              className="btn-brutal"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 800,
                backgroundColor: isActive ? 'var(--accent-yellow)' : 'var(--surface)',
                color: isActive ? '#09090B' : 'var(--ink)',
                boxShadow: isActive ? '2px 2px 0 var(--shadow-color)' : 'none',
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Article Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="card-brutal"
            style={{
              padding: '18px',
              backgroundColor: 'var(--surface)',
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <span
                  className="badge-brutal badge-blue"
                  style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                >
                  <Tag size={10} />
                  <span>{post.category}</span>
                </span>
                <span
                  className="tag-mono"
                  style={{
                    fontSize: '0.68rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Clock size={11} />
                  <span>{post.readingTime}</span>
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {post.title}
              </h2>

              <p
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--muted)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {post.description}
              </p>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginTop: '4px',
              }}
            >
              <span>Read Full Guide</span>
              <ArrowRight size={13} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
