import { NavigationItem } from '@/types';
import { supabaseAdmin } from '../supabase/admin';
import { createServerSupabaseClient } from '../supabase/server';
import { unstable_cache } from 'next/cache';

export const DEFAULT_NAV_ITEMS: NavigationItem[] = [
  { id: 'def-1', label: 'Home', href: '/', orderNum: 0, isActive: true },
  { id: 'def-2', label: 'Unicorn', href: '/categories/unicorn', orderNum: 1, isActive: true },
  { id: 'def-3', label: 'Failure', href: '/categories/failure', orderNum: 2, isActive: true },
  { id: 'def-4', label: 'Finance', href: '/categories/finance', orderNum: 3, isActive: true },
  { id: 'def-5', label: 'Crypto Web3', href: '/categories/crypto-web3', orderNum: 4, isActive: true },
  { id: 'def-6', label: 'Founder Biography', href: '/categories/founder-biography', orderNum: 5, isActive: true },
  { id: 'def-7', label: 'Case Studies', href: '/case-studies', orderNum: 6, isActive: true },
  { id: 'def-8', label: 'Blogs', href: '/blogs', orderNum: 7, isActive: true },
];

function mapNavigationItem(row: any): NavigationItem {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    orderNum: row.order_num ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

async function getCachedNavigationItems(): Promise<NavigationItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .order('order_num', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_NAV_ITEMS;
    }

    const items = data.map(mapNavigationItem);

    // Guarantee 'Home' is first if not already present
    const hasHome = items.some(i => i.href === '/');
    if (!hasHome) {
      return [{ id: 'home-pinned', label: 'Home', href: '/', orderNum: -1, isActive: true }, ...items];
    }

    return items;
  } catch {
    return DEFAULT_NAV_ITEMS;
  }
}

export const fetchNavigationItems = unstable_cache(
  getCachedNavigationItems,
  ['navigation_items_v2'],
  { revalidate: 60, tags: ['navigation'] }
);

export async function fetchAdminNavigationItems(): Promise<NavigationItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('navigation_items')
      .select('*')
      .order('order_num', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_NAV_ITEMS;
    }

    return data.map(mapNavigationItem);
  } catch {
    return DEFAULT_NAV_ITEMS;
  }
}
