export default function manifest() {
  return {
    id: '/',
    name: 'MakeAPost — Screenshot Studio & AI Post Generator',
    short_name: 'MakeAPost',
    description:
      'Turn raw screenshots into viral social posts in seconds. Client-side HTML5 Canvas editor + Multimodal AI writer for X, LinkedIn, and Reddit with zero storage.',
    start_url: '/editor',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#F8FAFC',
    theme_color: '#FFD93D',
    categories: ['productivity', 'social', 'utilities', 'design'],
    shortcuts: [
      {
        name: 'Open Studio Editor',
        short_name: 'Studio',
        description: 'Open the 30/70 screenshot editor and AI post generator',
        url: '/editor',
      },
      {
        name: 'Pricing & Plans',
        short_name: 'Pricing',
        description: 'View Free, Pro, and Advanced plans',
        url: '/#pricing',
      },
      {
        name: 'Account Settings',
        short_name: 'Settings',
        description: 'Manage daily credits, watermark branding, and theme',
        url: '/settings',
      },
    ],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
