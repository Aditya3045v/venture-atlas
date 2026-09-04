import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Search Intelligence & Term Sheets',
  description: 'Search across 60-word briefs, startup breakdowns, and venture capital essays on Venture Atlas.',
  canonicalPath: '/search',
  section: 'Search',
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
