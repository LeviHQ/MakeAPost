export default function manifest() {
  return {
    name: 'MakeAPost — Screenshot Beautifier & AI Social Post Studio',
    short_name: 'MakeAPost',
    description:
      'Turn raw screenshots into viral social posts in seconds. 100% client-side privacy-first studio.',
    start_url: '/editor',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#FFD93D',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
