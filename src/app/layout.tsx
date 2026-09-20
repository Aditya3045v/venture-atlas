import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { ToastProvider } from '../components/providers/ToastProvider';
import { AccessibilityProvider } from '../components/providers/AccessibilityProvider';
import { AudioPlayerProvider } from '../components/providers/AudioPlayerProvider';
import { WelcomeOverlay } from '../components/home/WelcomeOverlay';
import { SITE_URL } from '../lib/site-url';

const spaceGrotesk = { variable: '--font-display' };
const plusJakartaSans = { variable: '--font-body' };
const jetbrainsMono = { variable: '--font-mono' };
const inter = { variable: '--font-inter' };
const fraunces = { variable: '--font-fraunces' };
const ibmPlexMono = { variable: '--font-plex-mono' };

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
  title: 'Venture Atlas — Real-Time Startup Intelligence & Venture Briefs',
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
    title: 'Venture Atlas — Real-Time Startup Intelligence & Venture Briefs',
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
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-text-primary transition-colors font-body">
        <ThemeProvider>
          <AccessibilityProvider>
            <ToastProvider>
              <AudioPlayerProvider>
                <WelcomeOverlay />
                {children}
              </AudioPlayerProvider>
            </ToastProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
