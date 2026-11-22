import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import PwaRegister from '@/components/PwaRegister';
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

export const metadata = {
  metadataBase: new URL('https://makeapost.app'),
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
    url: 'https://makeapost.app',
    siteName: 'MakeAPost',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakeAPost — Turn Screenshots into Viral Social Posts',
    description:
      'Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen.',
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

// Zero-flash inline script to apply saved theme or OS preference before hydration
const themeScript = `
(function() {
  try {
    var savedTheme = localStorage.getItem('makeapost-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = savedTheme || (prefersDark ? 'dark' : 'light');
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
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
