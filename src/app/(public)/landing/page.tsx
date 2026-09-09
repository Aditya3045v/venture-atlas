import React from 'react';
import dynamic from 'next/dynamic';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Venture Atlas — Bloomberg + Inshorts for Tech Founders & VCs',
  description:
    'Real-time startup, venture capital, and founder intelligence. 60-word dispatches, visual canvas breakdowns, and global funding telemetry for founders, VCs, and operators.',
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
