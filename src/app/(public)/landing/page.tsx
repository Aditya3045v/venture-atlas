import React from 'react';
import dynamic from 'next/dynamic';
import { constructMetadata } from '@/lib/seo';

import { LandingView } from '@/components/landing/LandingView';

export const metadata = constructMetadata({
  title: 'Venture Atlas — Bloomberg + Inshorts for Tech Founders & VCs',
  description:
    'Real-time startup, venture capital, and founder intelligence. 60-word dispatches, visual canvas breakdowns, and global funding telemetry for founders, VCs, and operators.',
  canonicalPath: '/landing',
});

export default function LandingPage() {
  return <LandingView />;
}
