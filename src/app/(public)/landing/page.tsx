import React from 'react';
import dynamic from 'next/dynamic';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Executive Intelligence & 60-Word News',
  description:
    'Catch up on seed rounds, venture capital, AI breakthroughs, and market shifts with 60-word concise news briefs and audio summaries.',
  canonicalPath: '/landing',
});

const DynamicLandingView = dynamic(
  () => import('@/components/landing/LandingView').then(mod => mod.LandingView),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xs font-mono uppercase tracking-widest text-text-tertiary animate-pulse">
          Loading Venture Atlas...
        </div>
      </div>
    ),
  }
);

export default function LandingPage() {
  return <DynamicLandingView />;
}
