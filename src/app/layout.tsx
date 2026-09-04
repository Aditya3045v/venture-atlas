import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono, Inter } from 'next/font/google';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { ToastProvider } from '../components/providers/ToastProvider';
import { AccessibilityProvider } from '../components/providers/AccessibilityProvider';
import { AudioPlayerProvider } from '../components/providers/AudioPlayerProvider';
import { SITE_URL } from '../lib/site-url';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['600', '700'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['500', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F9FA' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION || process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

const verificationConfig = (googleVerification || bingVerification)
  ? {
      ...(googleVerification ? { google: googleVerification } : {}),
      ...(bingVerification ? { other: { 'msvalidate.01': [bingVerification] } } : {}),
    }
  : undefined;

export const metadata: Metadata = {
  title: 'Venture Atlas — Startup & Business News in 60 Words',
  description:
    'Venture Atlas delivers rapid, high-impact news and editorial deep-dives across venture capital, startups, tech breakthroughs, founders, and public markets.',
  keywords: [
    'Venture Capital',
    'Startup News',
    'Silicon Valley',
    'Founders',
    'Seed Funding',
    'AI Startups',
    'Tech Markets',
  ],
  authors: [{ name: 'Venture Atlas Editorial Board' }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Venture Atlas — Startup & Business News in 60 Words',
    description:
      'Venture Atlas delivers rapid, high-impact news across venture capital, startups, and tech-business.',
    url: SITE_URL,
    siteName: 'Venture Atlas',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venture Atlas',
    description: 'Fast-scanning business and venture capital news.',
  },
  ...(verificationConfig ? { verification: verificationConfig } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-text-primary transition-colors font-body">
        <ThemeProvider>
          <AccessibilityProvider>
            <ToastProvider>
              <AudioPlayerProvider>
                {children}
              </AudioPlayerProvider>
            </ToastProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
