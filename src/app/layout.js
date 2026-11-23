import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import PwaRegister from '@/components/PwaRegister';
import UserThemeSync from '@/components/UserThemeSync';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Determine reliable base URL across local dev, preview deployments, and custom production domains
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
    return url.startsWith('http') ? url : `https://${url}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://makeapost.app';
};

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'MakeAPost — Turn Screenshots into Viral Social Posts',
  description:
    'Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen.',
  keywords: [
    'screenshot beautifier',
    'social media post generator',
    'screenshot to viral post',
    'shots so alternative',
    'AI social media manager',
    'X threads generator',
    'LinkedIn post generator',
    'MakeAPost',
  ],
  authors: [{ name: 'MakeAPost' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MakeAPost',
  },
  openGraph: {
    title: 'MakeAPost — Turn Screenshots into Viral Social Posts',
    description:
      'Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen.',
    url: '/',
    siteName: 'MakeAPost',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MakeAPost — Turn raw screenshots into viral social posts in seconds',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakeAPost — Turn Screenshots into Viral Social Posts',
    description:
      'Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen.',
    images: ['/og-image.png'],
    creator: '@makeapost',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFD93D' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0B0E' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Zero-flash inline script: Default to 'light' mode, respect saved user preference
const themeScript = `
(function() {
  try {
    var savedTheme = localStorage.getItem('makeapost-theme');
    var theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <PwaRegister />
        <UserThemeSync />
        {children}
      </body>
    </html>
  );
}
