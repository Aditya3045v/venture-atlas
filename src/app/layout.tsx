import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { ToastProvider } from '../components/providers/ToastProvider';
import { AccessibilityProvider } from '../components/providers/AccessibilityProvider';
import { AccessibilityModal } from '../components/ui/AccessibilityModal';
import { Header } from '../components/layout/Header';
import { MobileNav } from '../components/layout/MobileNav';
import { Footer } from '../components/layout/Footer';

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
  metadataBase: new URL('https://ventureatlas.io'),
  openGraph: {
    title: 'Venture Atlas — Startup & Business News in 60 Words',
    description:
      'Venture Atlas delivers rapid, high-impact news across venture capital, startups, and tech-business.',
    url: 'https://ventureatlas.io',
    siteName: 'Venture Atlas',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venture Atlas',
    description: 'Fast-scanning business and venture capital news.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-text-primary transition-colors">
        <ThemeProvider>
          <AccessibilityProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>
              <Footer />
              <MobileNav />
              <AccessibilityModal />
            </ToastProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
