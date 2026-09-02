import { NextResponse } from 'next/server';
import { fetchNavigationItems } from '@/lib/data/navigation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await fetchNavigationItems();
    return NextResponse.json({ items }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ items: [], error: error?.message }, { status: 500 });
  }
}
