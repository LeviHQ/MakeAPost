import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
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
  openGraph: {
    title: 'MakeAPost — Turn Screenshots into Viral Social Posts',
    description:
      'Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen.',
    type: 'website',
    locale: 'en_US',
    siteName: 'MakeAPost',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakeAPost — Turn Screenshots into Viral Social Posts',
    description:
      'Turn raw screenshots into viral social posts in seconds. Edit your image & generate tailored X, LinkedIn, and Reddit posts in one screen.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
