import { ALTERNATIVES_LIST } from '@/lib/alternativesData';
import { BLOG_POSTS } from '@/lib/blogData';

export default function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://makeapost.site')
    .trim()
    .replace(/\/$/, '');
  const now = new Date('2026-11-28T00:00:00Z');

  const staticRoutes = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/editor`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/founder`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/refund`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const alternativeRoutes = ALTERNATIVES_LIST.map((alt) => ({
    url: `${baseUrl}/alternatives/${alt.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(`${post.publishedAt}T00:00:00Z`),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...alternativeRoutes, ...blogRoutes];
}
