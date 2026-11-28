export default function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://makeapost.site')
    .trim()
    .replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/editor',
          '/about',
          '/founder',
          '/contact',
          '/privacy',
          '/terms',
          '/refund',
          '/blog',
          '/alternatives',
          '/llms.txt',
          '/llms-full.txt',
          '/ai.txt',
          '/ai-snapshot.json',
          '/openapi.json',
        ],
        disallow: ['/api/', '/auth/', '/settings'],
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: ['/'],
        disallow: ['/api/', '/auth/', '/settings'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
