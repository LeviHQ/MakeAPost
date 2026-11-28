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
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim();
    return url.startsWith('http') ? url : `https://${url}`;
  }
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
  return 'https://makeapost.site';
};

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  applicationName: 'MakeAPost',
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'MakeAPost — Screenshot Beautifier & AI Social Post Generator',
    template: '%s | MakeAPost',
  },
  description:
    'Turn raw screenshots into viral X, LinkedIn & Reddit posts in 10 seconds. Client-side HTML5 Canvas editor (30 Cosmic & Neon themes, blur redaction) + Multimodal AI writer with zero storage.',
  keywords: [
    'screenshot beautifier',
    'AI social media post generator',
    'screenshot to viral post',
    'code screenshot generator',
    'shots.so alternative',
    'carbon alternative',
    'ray.so alternative',
    'X post generator from screenshot',
    'LinkedIn post generator',
    'Reddit launch post generator',
    'build in public tool',
    'zero storage screenshot editor',
    'MakeAPost',
  ],
  authors: [{ name: 'Adarsh Jayprakash Mishra', url: 'https://makeapost.site/founder' }],
  creator: 'Adarsh Jayprakash Mishra',
  publisher: 'MakeAPost',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    title: 'MakeAPost — Screenshot Beautifier & AI Social Post Generator',
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
    title: 'MakeAPost — Screenshot Beautifier & AI Social Post Generator',
    description:
      'Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen.',
    images: ['/og-image.png'],
    creator: '@AdarshMi18',
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
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="11a5Zl24NpMqkMpv6iijXQ"
          async
        />
      </head>
      <body suppressHydrationWarning>
        <PwaRegister />
        <UserThemeSync />
        {children}
      </body>
    </html>
  );
}
