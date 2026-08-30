import React from 'react';
import { LandingView } from '@/components/landing/LandingView';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Venture Atlas — Read What’s Breaking in 60 Words',
  description:
    'Catch up on seed rounds, venture capital, AI breakthroughs, and market shifts with 60-word concise news briefs and audio summaries.',
});

export default function LandingPage() {
  return <LandingView />;
}
